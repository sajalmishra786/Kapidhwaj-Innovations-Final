<?php
/**
 * Contact form endpoint.
 *
 * Accepts a JSON POST of { name, email, message, company } and relays it to the
 * configured inbox over SMTP via PHPMailer. `company` is a honeypot — real users
 * never see it, so anything submitted in it is treated as a bot and silently
 * accepted without sending.
 *
 * Always responds with JSON: { ok: bool, message: string, errors?: {field: msg} }
 */

declare(strict_types=1);

/* ── Bootstrap ───────────────────────────────────────────────────────────── */

// Never let a PHP warning leak into the JSON body.
ini_set('display_errors', '0');
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
$honey   = $clean($data['company'] ?? '');

// Bot filled the hidden field. Pretend it worked; send nothing.
if ($honey !== '') {
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

$mail = new PHPMailer\PHPMailer\PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $config['smtp_host'];
    $mail->Port       = (int) $config['smtp_port'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['smtp_user'];
    $mail->Password   = $config['smtp_pass'];
    $mail->CharSet    = 'UTF-8';
    $mail->Timeout    = 15;

    if (!empty($config['smtp_secure'])) {
        $mail->SMTPSecure = $config['smtp_secure'] === 'ssl'
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    }

    if (!empty($config['debug'])) {
        $mail->SMTPDebug   = 2;
        $mail->Debugoutput = static function (string $str): void {
            @file_put_contents(__DIR__ . '/debug.log', date('c') . ' ' . $str . "\n", FILE_APPEND);
        };
    }

    // From must be an address the SMTP account may send as; the visitor goes in
    // Reply-To so hitting Reply in your mail client answers them directly.
    $mail->setFrom($config['from_email'], $config['from_name'] ?? '');
    $mail->addAddress($config['to_email'], $config['to_name'] ?? '');
    $mail->addReplyTo($email, $name);

    if (!empty($config['cc_email']))  { $mail->addCC($config['cc_email']); }
    if (!empty($config['bcc_email'])) { $mail->addBCC($config['bcc_email']); }

    $meta = [
        'Received' => date('D, d M Y H:i:s'),
        'IP'       => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'Page'     => $_SERVER['HTTP_REFERER'] ?? 'unknown',
    ];

    $mail->Subject = 'New enquiry from ' . $name;
    $mail->isHTML(true);
    $mail->Body    = renderHtmlBody($name, $email, $message, $meta);
    $mail->AltBody = renderTextBody($name, $email, $message, $meta);

    $mail->send();

    // Delivered — start the cooldown window now.
    if ($window > 0) {
        @touch($stampFile);
    }

    /* Auto-reply — a failure here must not fail the whole request, since the
       real message already reached the inbox. */
    if (!empty($config['send_autoreply'])) {
        try {
            $reply = new PHPMailer\PHPMailer\PHPMailer(true);
            $reply->isSMTP();
            $reply->Host     = $config['smtp_host'];
            $reply->Port     = (int) $config['smtp_port'];
            $reply->SMTPAuth = true;
            $reply->Username = $config['smtp_user'];
            $reply->Password = $config['smtp_pass'];
            $reply->CharSet  = 'UTF-8';
            $reply->Timeout  = 15;

            if (!empty($config['smtp_secure'])) {
                $reply->SMTPSecure = $config['smtp_secure'] === 'ssl'
                    ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                    : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            }

            $reply->setFrom($config['from_email'], $config['from_name'] ?? '');
            $reply->addAddress($email, $name);
            $reply->addReplyTo($config['to_email'], $config['to_name'] ?? '');
            $reply->Subject = 'We received your message — Kapidhwaj Innovations';
            $reply->isHTML(true);
            $reply->Body    = renderAutoReplyHtml($name, $message);
            $reply->AltBody = renderAutoReplyText($name, $message);
            $reply->send();
        } catch (Throwable $e) {
            error_log('[contact] auto-reply failed: ' . $e->getMessage());
        }
    }

    respond(200, ['ok' => true, 'message' => 'Message sent.']);
} catch (Throwable $e) {
    // Log the real reason; return something generic so SMTP details stay private.
    error_log('[contact] send failed: ' . $e->getMessage());
    respond(502, [
        'ok'      => false,
        'message' => 'We could not send your message right now. Please email us directly at '
                     . ($config['to_email'] ?? 'our address') . '.',
    ]);
}

/* ── Templates ───────────────────────────────────────────────────────────── */

function renderHtmlBody(string $name, string $email, string $message, array $meta): string
{
    $e    = static fn (string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    $rows = '';
    foreach ($meta as $k => $v) {
        $rows .= '<tr><td style="padding:2px 12px 2px 0;color:#8a8577;">' . $e((string) $k)
               . '</td><td style="color:#3a3527;">' . $e((string) $v) . '</td></tr>';
    }

    return '<!doctype html><html><body style="margin:0;background:#faf8f2;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">'
        . '<div style="max-width:600px;margin:0 auto;padding:32px 24px;">'
        . '<p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8a8577;">Kapidhwaj Innovations</p>'
        . '<h1 style="margin:0 0 24px;font-size:22px;color:#1a1714;">New website enquiry</h1>'
        . '<div style="background:#fff;border:1px solid #eae6db;border-radius:14px;padding:24px;">'
        . '<p style="margin:0 0 6px;font-size:12px;color:#8a8577;">FROM</p>'
        . '<p style="margin:0 0 20px;font-size:16px;color:#1a1714;"><strong>' . $e($name) . '</strong><br>'
        . '<a href="mailto:' . $e($email) . '" style="color:#e0795e;">' . $e($email) . '</a></p>'
        . '<p style="margin:0 0 6px;font-size:12px;color:#8a8577;">MESSAGE</p>'
        . '<div style="font-size:15px;line-height:1.6;color:#3a3527;white-space:pre-wrap;">' . $e($message) . '</div>'
        . '</div>'
        . '<table style="margin-top:16px;font-size:12px;">' . $rows . '</table>'
        . '<p style="margin-top:20px;font-size:12px;color:#a8a396;">Reply directly to this email to respond to ' . $e($name) . '.</p>'
        . '</div></body></html>';
}

function renderTextBody(string $name, string $email, string $message, array $meta): string
{
    $out = "New website enquiry\n===================\n\n"
         . "From:  $name\nEmail: $email\n\nMessage:\n$message\n\n---\n";
    foreach ($meta as $k => $v) {
        $out .= "$k: $v\n";
    }
    return $out;
}

function renderAutoReplyHtml(string $name, string $message): string
{
    $e     = static fn (string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    $first = $e(strtok($name, ' ') ?: $name);

    return '<!doctype html><html><body style="margin:0;background:#faf8f2;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">'
        . '<div style="max-width:600px;margin:0 auto;padding:32px 24px;">'
        . '<p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8a8577;">Kapidhwaj Innovations</p>'
        . '<h1 style="margin:0 0 16px;font-size:22px;color:#1a1714;">Thanks, ' . $first . '.</h1>'
        . '<p style="font-size:15px;line-height:1.65;color:#3a3527;">We have your message and will come back to you within one business day with a point of view and a path forward.</p>'
        . '<div style="margin-top:20px;background:#fff;border:1px solid #eae6db;border-radius:14px;padding:20px;">'
        . '<p style="margin:0 0 8px;font-size:12px;color:#8a8577;">YOUR MESSAGE</p>'
        . '<div style="font-size:14px;line-height:1.6;color:#3a3527;white-space:pre-wrap;">' . $e($message) . '</div></div>'
        . '<p style="margin-top:24px;font-size:13px;color:#8a8577;">— The Kapidhwaj Innovations team</p>'
        . '</div></body></html>';
}

function renderAutoReplyText(string $name, string $message): string
{
    $first = strtok($name, ' ') ?: $name;
    return "Thanks, $first.\n\n"
         . "We have your message and will come back to you within one business day "
         . "with a point of view and a path forward.\n\n"
         . "Your message:\n$message\n\n— The Kapidhwaj Innovations team\n";
}
