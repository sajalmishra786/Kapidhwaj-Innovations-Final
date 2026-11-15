/**
 * Contact form endpoint for Vercel — the Node port of api/send.php.
 *
 * Accepts a JSON POST of { name, email, message, kd_hp_7f3 } and relays it to
 * the configured inbox over SMTP. Configuration comes from environment
 * variables (see api/_lib/config.ts), not config.php.
 *
 * Always responds with JSON: { ok: bool, message: string, errors?, reference? }
 *
 * vercel.json rewrites /api/send.php here, so the frontend needs no change.
 * It is not named send.ts because Vercel rejects two files in api/ that share
 * a name without their extension (send.php is kept for the Hostinger deploy).
 */

import { createHash, randomBytes } from 'node:crypto';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { waitUntil } from '@vercel/functions';
import { loadConfig, missingConfig, type MailConfig } from './_lib/config.js';
import { parseBody, validate } from './_lib/validate.js';
import {
  renderAutoReplyHtml,
  renderAutoReplyText,
  renderHtmlBody,
  renderTextBody,
  type Meta,
} from './_lib/templates.js';

const MAX_BODY_BYTES = 20_000;
const SMTP_TIMEOUT_MS = 15_000;

interface Payload {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  reference?: string;
}

/* ── Rate limiting ─────────────────────────────────────────────────────────
   Best-effort and per function instance: serverless has no shared disk, so
   this stops rapid repeat clicks, not a determined attacker. For a hard limit
   use Vercel's Firewall rate-limit rules or Upstash Redis. */
const lastSent = new Map<string, number>();

function rateKey(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

function isRateLimited(ip: string, windowSec: number, now: number): boolean {
  if (windowSec <= 0) return false;
  const last = lastSent.get(rateKey(ip));
  return last !== undefined && now - last < windowSec * 1000;
}

function markSent(ip: string, windowSec: number, now: number): void {
  if (windowSec <= 0) return;
  // Drop expired stamps so the map can't grow without bound on a warm instance.
  for (const [key, at] of lastSent) {
    if (now - at >= windowSec * 1000) lastSent.delete(key);
  }
  lastSent.set(rateKey(ip), now);
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function json(status: number, payload: Payload, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function corsHeaders(origin: string, allowed: readonly string[]): Record<string, string> {
  if (origin === '' || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/** Same-origin requests also send Origin on POST; those are always allowed. */
function isAllowedOrigin(origin: string, requestUrl: string, allowed: readonly string[]): boolean {
  if (origin === '') return true;
  return origin === new URL(requestUrl).origin || allowed.includes(origin);
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  return forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

/** Human-readable reference, e.g. KI-261115-3F9A. */
function makeReference(now: Date): string {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, '');
  return `KI-${ymd}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

function createMailer(config: MailConfig): Transporter {
  // Greet the server as the sending domain, not the container hostname: a
  // localhost/IP HELO and Message-ID are spam signals.
  const domain = config.fromEmail.split('@')[1] ?? undefined;

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
    name: domain,
    // One kept-alive connection carries both the inbox copy and the auto-reply.
    pool: true,
    maxConnections: 1,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });
}

async function sendAutoreply(mailer: Transporter, config: MailConfig, name: string, email: string, message: string, ref: string): Promise<void> {
  try {
    await mailer.sendMail({
      from: { name: config.fromName, address: config.fromEmail },
      to: { name, address: email },
      replyTo: { name: config.toName, address: config.toEmail },
      subject: `We received your message [${ref}]`,
      headers: {
        'X-Entity-Ref-ID': ref,
        // RFC 3834: an automatic reply — stops out-of-office loops.
        'Auto-Submitted': 'auto-replied',
        'X-Auto-Response-Suppress': 'All',
      },
      html: renderAutoReplyHtml(name, message, ref, config.toEmail),
      text: renderAutoReplyText(name, message, ref, config.toEmail),
    });
  } catch (err) {
    // The visitor already has their answer and the inbox has the message.
    console.error('[contact] auto-reply failed:', err instanceof Error ? err.message : err);
  } finally {
    mailer.close();
  }
}

/* ── Handler ───────────────────────────────────────────────────────────── */

async function handle(request: Request): Promise<Response> {
  const missing = missingConfig();
  if (missing.length > 0) {
    console.error(`[contact] missing environment variables: ${missing.join(', ')}`);
    return json(500, { ok: false, message: 'The contact form is not configured yet.' });
  }
  const config = loadConfig();

  const origin = request.headers.get('origin') ?? '';
  const cors = corsHeaders(origin, config.allowedOrigins);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'POST') {
    return json(405, { ok: false, message: 'Method not allowed.' }, { ...cors, Allow: 'POST, OPTIONS' });
  }
  if (!isAllowedOrigin(origin, request.url, config.allowedOrigins)) {
    return json(403, { ok: false, message: 'Origin not allowed.' });
  }

  const ip = clientIp(request);
  const nowMs = Date.now();
  if (isRateLimited(ip, config.rateLimitSeconds, nowMs)) {
    return json(429, { ok: false, message: 'You just sent a message. Please wait a moment before sending another.' }, cors);
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return json(413, { ok: false, message: 'That message is too large.' }, cors);
  }

  const input = parseBody(raw, request.headers.get('content-type') ?? '');
  if (!input) {
    return json(400, { ok: false, message: 'Please check the fields below.' }, cors);
  }

  // Bot filled the hidden field: pretend it worked, send nothing, but log it.
  if (input.honeypot !== '') {
    console.warn('[contact] honeypot filled — submission discarded (no email sent)');
    return json(200, { ok: true, message: 'Message sent.' }, cors);
  }

  const errors = validate(input);
  if (Object.keys(errors).length > 0) {
    return json(422, { ok: false, message: 'Please check the fields below.', errors }, cors);
  }

  const { name, email, message } = input;
  const now = new Date(nowMs);
  const ref = makeReference(now);
  const meta: Meta = {
    Received: now.toUTCString(),
    IP: ip,
    Page: request.headers.get('referer') ?? 'unknown',
  };

  const mailer = createMailer(config);
  try {
    await mailer.sendMail({
      from: { name: config.fromName, address: config.fromEmail },
      to: { name: config.toName, address: config.toEmail },
      // The visitor goes in Reply-To so hitting Reply answers them directly.
      replyTo: { name, address: email },
      cc: config.ccEmail || undefined,
      bcc: config.bccEmail || undefined,
      subject: `New enquiry from ${name} [${ref}]`,
      // Stops Gmail from collapsing separate enquiries into one thread.
      headers: { 'X-Entity-Ref-ID': ref },
      html: renderHtmlBody(name, email, message, meta, ref),
      text: renderTextBody(name, email, message, meta, ref),
    });
  } catch (err) {
    mailer.close();
    // Log the real reason; return something generic so SMTP details stay private.
    console.error('[contact] send failed:', err instanceof Error ? err.message : err);
    return json(502, {
      ok: false,
      message: `We could not send your message right now. Please email us directly at ${config.toEmail}.`,
    }, cors);
  }

  markSent(ip, config.rateLimitSeconds, nowMs);

  // Answer the visitor now; the confirmation email finishes in the background.
  if (config.sendAutoreply) {
    waitUntil(sendAutoreply(mailer, config, name, email, message, ref));
  } else {
    mailer.close();
  }

  return json(200, { ok: true, message: 'Message sent.', reference: ref }, cors);
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      return await handle(request);
    } catch (err) {
      console.error('[contact] unexpected error:', err instanceof Error ? err.stack : err);
      return json(500, { ok: false, message: 'Something went wrong on our end. Please email us directly.' });
    }
  },
};
