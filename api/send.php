<?php
/**
 * Contact form endpoint.
 *
 * Accepts a JSON POST of { name, email, message, kd_hp_7f3 } and relays it to the
 * configured inbox over SMTP via PHPMailer. `kd_hp_7f3` is a honeypot — real users
 * never see it, so anything submitted in it is treated as a bot and silently
 * accepted without sending.
 *
 * Always responds with JSON: { ok: bool, message: string, errors?: {field: msg} }
 */

declare(strict_types=1);

/* ── Bootstrap ───────────────────────────────────────────────────────────── */

// Never let a PHP warning leak into the JSON body.
ini_set('display_errors', '0');
// Compression would change the body length after Content-Length is set (see respondAndContinue).
@ini_set('zlib.output_compression', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

/** Emit a JSON response and stop. (`void` rather than `never` so this runs on PHP 8.0.) */
function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    error_log('[contact] config.php is missing — copy config.example.php to config.php');
    respond(500, ['ok' => false, 'message' => 'The contact form is not configured yet.']);
}
$config = require $configPath;
require __DIR__ . "/templates.php";

/* ── CORS ────────────────────────────────────────────────────────────────── */

$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $config['allowed_origins'] ?? [];

if ($origin !== '' && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
}

// Preflight.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

// A cross-origin POST from an origin we did not allow.
if ($origin !== '' && !in_array($origin, $allowed, true)) {
    respond(403, ['ok' => false, 'message' => 'Origin not allowed.']);
}

/* ── Rate limiting (per IP, filesystem-backed) ───────────────────────────── */

/* The stamp is only written once a message is actually sent (see below). If it
   were written here, a visitor whose submission failed validation would be
   locked out for the whole window and unable to correct and resubmit. */
$window    = (int) ($config['rate_limit_seconds'] ?? 30);
$stampFile = sys_get_temp_dir() . '/kapidhwaj_contact_'
           . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');

if ($window > 0 && is_file($stampFile) && (time() - (int) filemtime($stampFile)) < $window) {
    respond(429, [
        'ok'      => false,
        'message' => 'You just sent a message. Please wait a moment before sending another.',
    ]);
}

/* ── Parse + validate input ──────────────────────────────────────────────── */

$raw = file_get_contents('php://input') ?: '';

if (strlen($raw) > 20000) {
    respond(413, ['ok' => false, 'message' => 'That message is too large.']);
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    // Fall back to a classic form POST so the endpoint also works without JS.
    $data = $_POST;
}

$clean = static function (mixed $v): string {
    // Strip control characters (header-injection vector) and trim.
    return trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) $v) ?? '');
};

$name    = $clean($data['name'] ?? '');
$email   = $clean($data['email'] ?? '');
$message = trim((string) ($data['message'] ?? ''));
// Honeypot. Named so browsers never autofill it (the old `company` name was
// autofilled, which silently dropped real messages). Must match Contact.tsx.
$honey   = $clean($data['kd_hp_7f3'] ?? '');

// Bot filled the hidden field. Pretend it worked; send nothing — but log it, so a
// discarded message is never invisible to whoever runs the site.
if ($honey !== '') {
    error_log('[contact] honeypot filled — submission discarded (no email sent)');
    if (!empty($config['debug'])) {
        @file_put_contents(__DIR__ . '/debug.log', date('c') . " HONEYPOT: submission discarded, no email sent\n", FILE_APPEND);
    }
    respond(200, ['ok' => true, 'message' => 'Message sent.']);
}

$errors = [];

if (mb_strlen($name) < 2) {
    $errors['name'] = 'Please tell us your name.';
} elseif (mb_strlen($name) > 100) {
    $errors['name'] = 'That name is too long.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Enter a valid email address.';
} elseif (mb_strlen($email) > 254) {
    $errors['email'] = 'That email address is too long.';
}

if (mb_strlen($message) < 10) {
    $errors['message'] = 'A little more detail helps.';
} elseif (mb_strlen($message) > 5000) {
    $errors['message'] = 'Please keep it under 5000 characters.';
}

if ($errors) {
    respond(422, ['ok' => false, 'message' => 'Please check the fields below.', 'errors' => $errors]);
}

/* ── Load PHPMailer ──────────────────────────────────────────────────────── */

if (is_file(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';           // composer install inside api/
} elseif (is_file(dirname(__DIR__) . '/vendor/autoload.php')) {
    require dirname(__DIR__) . '/vendor/autoload.php';  // composer install at project root
} elseif (is_file(__DIR__ . '/lib/PHPMailer/src/PHPMailer.php')) {
    require __DIR__ . '/lib/PHPMailer/src/Exception.php';
    require __DIR__ . '/lib/PHPMailer/src/PHPMailer.php';
    require __DIR__ . '/lib/PHPMailer/src/SMTP.php';
} else {
    error_log('[contact] PHPMailer not found — run `composer require phpmailer/phpmailer` in api/');
    respond(500, ['ok' => false, 'message' => 'Mail service is unavailable. Please email us directly.']);
}

/* ── Compose + send ──────────────────────────────────────────────────────── */

/*
  Speed. Every SMTP session to Gmail costs ~2.5s before a byte of mail moves
  (TCP + STARTTLS + AUTH). The old flow opened two sessions back to back — the
  inbox copy, then the visitor's confirmation — and only then answered the
  browser, so a visitor watched a spinner for 6–7s. Now:

   1. one session, kept alive, carries both messages (one handshake saved);
   2. the browser gets its answer as soon as the inbox copy is accepted, and the
      confirmation goes out after the connection to the browser is closed.

  The success the visitor sees is still real: it is only sent once Gmail has
  accepted the message to the team inbox.
*/

// Human-readable reference shown in both emails and on the success screen.
$ref = 'KI-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));

$mail = createMailer($config);

try {
    $mail->setFrom($config['from_email'], $config['from_name'] ?? '');
    $mail->addAddress($config['to_email'], $config['to_name'] ?? '');
    // The visitor goes in Reply-To so hitting Reply answers them directly.
    $mail->addReplyTo($email, $name);

    if (!empty($config['cc_email']))  { $mail->addCC($config['cc_email']); }
    if (!empty($config['bcc_email'])) { $mail->addBCC($config['bcc_email']); }

    $meta = [
        'Received' => date('D, d M Y H:i:s'),
        'IP'       => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'Page'     => $_SERVER['HTTP_REFERER'] ?? 'unknown',
    ];

    $mail->Subject = 'New enquiry from ' . $name . ' [' . $ref . ']';
    // Stops Gmail from collapsing separate enquiries into one thread.
    $mail->addCustomHeader('X-Entity-Ref-ID', $ref);
    $mail->isHTML(true);
    $mail->Body    = renderHtmlBody($name, $email, $message, $meta, $ref);
    $mail->AltBody = renderTextBody($name, $email, $message, $meta, $ref);

    $mail->send();
} catch (Throwable $e) {
    $mail->smtpClose();
    // Log the real reason; return something generic so SMTP details stay private.
    error_log('[contact] send failed: ' . $e->getMessage());
    respond(502, [
        'ok'      => false,
        'message' => 'We could not send your message right now. Please email us directly at '
                     . ($config['to_email'] ?? 'our address') . '.',
    ]);
}

// Delivered — start the cooldown window, then let the visitor go.
if ($window > 0) {
    @touch($stampFile);
}
respondAndContinue(200, ['ok' => true, 'message' => 'Message sent.', 'reference' => $ref]);

/* Auto-reply, on the same SMTP session. The visitor already has their answer,
   and their message already reached the inbox, so a failure here is logged only. */
if (!empty($config['send_autoreply'])) {
    try {
        $mail->clearAllRecipients();
        $mail->clearReplyTos();
        $mail->clearCustomHeaders();

        $mail->addAddress($email, $name);
        $mail->addReplyTo($config['to_email'], $config['to_name'] ?? '');
        $mail->Subject = 'We received your message [' . $ref . ']';
        $mail->addCustomHeader('X-Entity-Ref-ID', $ref);
        // RFC 3834: an automatic reply. Stops out-of-office loops, and tells
        // filters this is a one-off transactional message, not a campaign.
        $mail->addCustomHeader('Auto-Submitted', 'auto-replied');
        $mail->addCustomHeader('X-Auto-Response-Suppress', 'All');
        $mail->Body    = renderAutoReplyHtml($name, $message, $ref, $config['to_email']);
        $mail->AltBody = renderAutoReplyText($name, $message, $ref, $config['to_email']);
        $mail->send();
    } catch (Throwable $e) {
        error_log('[contact] auto-reply failed: ' . $e->getMessage());
    }
}

$mail->smtpClose();
exit;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** An SMTP mailer configured from config.php, kept alive for more than one message. */
function createMailer(array $config): PHPMailer\PHPMailer\PHPMailer
{
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host          = $config['smtp_host'];
    $mail->Port          = (int) $config['smtp_port'];
    $mail->SMTPAuth      = true;
    $mail->Username      = $config['smtp_user'];
    $mail->Password      = $config['smtp_pass'];
    $mail->CharSet       = 'UTF-8';
    $mail->Encoding      = 'quoted-printable';
    $mail->Timeout       = 15;
    $mail->SMTPKeepAlive = true;

    if (!empty($config['smtp_secure'])) {
        $mail->SMTPSecure = $config['smtp_secure'] === 'ssl'
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    }

    /* Deliverability. Without a Hostname, PHPMailer greets Gmail as the machine
       name (127.0.0.1 / localhost) and stamps Message-IDs with it; both are spam
       signals. Use the sending domain instead, and make the envelope sender
       (Return-Path) the same address as From so bounces come home and SPF/DMARC
       evaluate the right domain. */
    $domain = substr(strrchr((string) $config['from_email'], '@') ?: '', 1);
    if ($domain !== '') {
        $mail->Hostname = $domain;
        $mail->Helo     = $domain;
    }
    $mail->Sender = $config['from_email'];

    if (!empty($config['debug'])) {
        $mail->SMTPDebug   = 2;
        $mail->Debugoutput = static function (string $str): void {
            @file_put_contents(__DIR__ . '/debug.log', date('c') . ' ' . $str . "\n", FILE_APPEND);
        };
    }

    return $mail;
}

/**
 * Send the JSON response and close the connection to the browser, then keep
 * running so slow follow-up work (the auto-reply) happens off the visitor's clock.
 * Uses the server's native hook where there is one (PHP-FPM, LiteSpeed — which
 * Hostinger runs); otherwise an explicit Content-Length + flush, which the PHP
 * dev server, Apache mod_php and the Vite proxy all treat as a finished response.
 */
function respondAndContinue(int $status, array $payload): void
{
    $body = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '{}';

    ignore_user_abort(true);
    @set_time_limit(60);
    http_response_code($status);
    header('Content-Length: ' . strlen($body));
    header('Connection: close');
    echo $body;

    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
        return;
    }
    if (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
        return;
    }
    while (ob_get_level() > 0) {
        ob_end_flush();
    }
    flush();
}
