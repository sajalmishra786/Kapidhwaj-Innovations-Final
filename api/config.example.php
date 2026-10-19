<?php
/**
 * Contact form configuration — TEMPLATE.
 *
 * Copy this file to `config.php` in the same directory and fill in real values.
 * `config.php` is gitignored; never commit real credentials.
 *
 *   cp api/config.example.php api/config.php
 */

return [
    /* ── SMTP transport ──────────────────────────────────────────────────
       Gmail: create an App Password (Google Account → Security → 2-Step
       Verification → App passwords). Your normal Gmail password will
       Other common hosts:
         Gmail      smtp.gmail.com        587  tls
         Outlook    smtp.office365.com    587  tls
         Zoho       smtp.zoho.com         587  tls
         cPanel     mail.yourdomain.com   465  ssl
    */
    'smtp_host'   => 'smtp.hostinger.com',
    'smtp_port'   => 465,
    'smtp_secure' => 'ssl',              // 'tls' for 587, 'ssl' for 465
    'smtp_user'   => 'support@tsukuyome.in',
    'smtp_pass'   => 'V3n>G3~@',

    /* ── Envelope ────────────────────────────────────────────────────────
       `from_email` MUST be an address the SMTP account is allowed to send as
       — normally the same as `smtp_user`. Putting the visitor's address here
       instead will get the mail rejected or spam-foldered by SPF/DMARC.
       The visitor's address is set as Reply-To, so hitting Reply still works.
    */
    'from_email' => 'support@tsukuyome.in',
    'from_name'  => 'Kapidhwaj Website',

    'to_email'   => 'contact@kapidhwajinnovations.com',
    'to_name'    => 'Kapidhwaj Innovations',

    // Optional extra recipients.
    'cc_email' => 'sunny.vinny546@gmail.com',
    'bcc_email' => '',

    /* ── Behaviour ───────────────────────────────────────────────────────── */

    // Send a "we got your message" confirmation back to the visitor.
    'send_autoreply' => true,

    // Minimum seconds between two submissions from the same IP.
    'rate_limit_seconds' => 30,

    /* Browser origins allowed to POST here. Add your production domain.
       The Vite dev server runs on :5173; Apache serves the built site on :80. */
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'https://kapidhwajinnovations.com',
        'https://brown-woodpecker-982026.hostingersite.com/',
        'https://www.kapidhwajinnovations.com',
    ],

    // Write SMTP conversation logs to api/debug.log. Leave false in production.
    'debug' => false,
];
