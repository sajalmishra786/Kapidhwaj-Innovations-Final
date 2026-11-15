/**
 * Contact form configuration, read from environment variables.
 *
 * This replaces api/config.php for the Vercel deployment. Set the values in
 * Vercel → Project → Settings → Environment Variables (see .env.example),
 * then redeploy. Nothing secret lives in the repository.
 *
 * Files under api/_lib are not exposed as functions (Vercel skips `_` paths).
 */

export interface MailConfig {
  readonly smtpHost: string;
  readonly smtpPort: number;
  /** true = implicit TLS (port 465); false = STARTTLS (port 587). */
  readonly smtpSecure: boolean;
  readonly smtpUser: string;
  readonly smtpPass: string;
  readonly fromEmail: string;
  readonly fromName: string;
  readonly toEmail: string;
  readonly toName: string;
  readonly ccEmail: string;
  readonly bccEmail: string;
  readonly sendAutoreply: boolean;
  readonly rateLimitSeconds: number;
  readonly allowedOrigins: readonly string[];
}

const DEFAULT_SMTP_PORT = 587;
const DEFAULT_RATE_LIMIT_SECONDS = 30;

const REQUIRED = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_TO'] as const;

function str(name: string, fallback = ''): string {
  return (process.env[name] ?? fallback).trim();
}

function int(name: string, fallback: number): number {
  const parsed = Number.parseInt(str(name), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function bool(name: string, fallback: boolean): boolean {
  const raw = str(name).toLowerCase();
  if (raw === '') return fallback;
  return raw === 'true' || raw === '1' || raw === 'yes';
}

/** Names of required variables that are unset, so the error can say which. */
export function missingConfig(): string[] {
  return REQUIRED.filter((name) => str(name) === '');
}

/** Build the config from the environment. Call missingConfig() first. */
export function loadConfig(): MailConfig {
  const smtpPort = int('SMTP_PORT', DEFAULT_SMTP_PORT);
  const smtpUser = str('SMTP_USER');
  const toEmail = str('MAIL_TO');

  return {
    smtpHost: str('SMTP_HOST'),
    smtpPort,
    // SMTP_SECURE accepts 'ssl'/'tls' like config.php did; default follows the port.
    smtpSecure: str('SMTP_SECURE') ? str('SMTP_SECURE').toLowerCase() === 'ssl' : smtpPort === 465,
    smtpUser,
    smtpPass: str('SMTP_PASS'),
    // Must be an address the SMTP account may send as, normally SMTP_USER.
    fromEmail: str('MAIL_FROM', smtpUser),
    fromName: str('MAIL_FROM_NAME', 'Kapidhwaj Website'),
    toEmail,
    toName: str('MAIL_TO_NAME', 'Kapidhwaj Innovations'),
    ccEmail: str('MAIL_CC'),
    bccEmail: str('MAIL_BCC'),
    sendAutoreply: bool('SEND_AUTOREPLY', true),
    rateLimitSeconds: int('RATE_LIMIT_SECONDS', DEFAULT_RATE_LIMIT_SECONDS),
    allowedOrigins: str('ALLOWED_ORIGINS')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  };
}
