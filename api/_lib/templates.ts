/**
 * Email templates for the contact relay — a port of api/templates.php.
 *
 * Table layout so Outlook renders it, inline styles only, a hidden preheader,
 * no remote images, one clear action, and a footer that says why the email
 * was sent. Every dynamic value passes through esc(). Nothing here sends mail.
 */

const MAIL_BRAND = 'Kapidhwaj Innovations';
const MAIL_SITE = 'https://kapidhwajinnovations.com';
const MAIL_INK = '#17150F';
const MAIL_BODY = '#3A3527';
const MAIL_MUTED = '#7A7465';
const MAIL_RULE = '#ECE8DD';
const MAIL_CANVAS = '#F6F4EE';
const MAIL_ACCENT = '#E0795E';
const MAIL_FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MAIL_MONO = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";

export type Meta = Readonly<Record<string, string>>;

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

/** First word of a name, for a human greeting. */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

/** Message text with line breaks kept, safe for HTML. */
function messageHtml(message: string): string {
  return esc(message).replace(/\r?\n/g, '<br>\n');
}

/** Shared shell: canvas, wordmark, white card, footer. `inner`/`footer` are escaped HTML. */
function mailShell(title: string, preheader: string, inner: string, footer: string): string {
  // Pad the preheader so clients don't pull body text into the preview.
  const pad = '&#847;&zwnj;&nbsp;'.repeat(40);

  return (
    '<!doctype html><html lang="en"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">' +
    `<title>${esc(title)}</title></head>` +
    `<body style="margin:0;padding:0;background:${MAIL_CANVAS};-webkit-font-smoothing:antialiased;">` +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">' +
    esc(preheader) + pad + '</div>' +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MAIL_CANVAS};">` +
    '<tr><td align="center" style="padding:40px 16px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">' +
    // Wordmark — text, not an image, so it always renders.
    `<tr><td style="padding:0 4px 24px;font-family:${MAIL_FONT};">` +
    `<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${MAIL_ACCENT};vertical-align:middle;"></span>` +
    `<span style="margin-left:10px;font-size:14px;font-weight:600;letter-spacing:-0.01em;color:${MAIL_INK};vertical-align:middle;">` +
    `${MAIL_BRAND}</span></td></tr>` +
    // Card.
    `<tr><td style="background:#FFFFFF;border:1px solid ${MAIL_RULE};border-radius:12px;padding:40px 36px;font-family:${MAIL_FONT};">` +
    inner +
    '</td></tr>' +
    // Footer.
    `<tr><td style="padding:24px 4px 0;font-family:${MAIL_FONT};font-size:12px;line-height:1.6;color:${MAIL_MUTED};">` +
    footer +
    `<br><br>${MAIL_BRAND} &middot; <a href="${MAIL_SITE}" style="color:${MAIL_MUTED};text-decoration:underline;">kapidhwajinnovations.com</a>` +
    '</td></tr>' +
    '</table></td></tr></table></body></html>'
  );
}

function heading(html: string): string {
  return `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-0.015em;color:${MAIL_INK};">${html}</h1>`;
}

function paragraph(html: string, extra = ''): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${MAIL_BODY};${extra}">${html}</p>`;
}

function rule(): string {
  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    `<td style="padding:12px 0 24px;"><div style="height:1px;line-height:1px;background:${MAIL_RULE};">&nbsp;</div></td>` +
    '</tr></table>'
  );
}

/** Small uppercase label above a block. */
function label(text: string): string {
  return `<p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MAIL_MUTED};">${esc(text)}</p>`;
}

/** Quoted copy of the visitor's message. */
function quote(message: string): string {
  return (
    `<div style="margin:0 0 24px;padding:16px 18px;background:${MAIL_CANVAS};border-left:3px solid ${MAIL_ACCENT};border-radius:0 8px 8px 0;` +
    `font-size:14px;line-height:1.65;color:${MAIL_BODY};word-break:break-word;">` +
    messageHtml(message) + '</div>'
  );
}

/** Bulletproof button (a padded table cell, works in Outlook). */
function button(href: string, text: string): string {
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;"><tr>' +
    `<td style="border-radius:8px;background:${MAIL_INK};">` +
    `<a href="${esc(href)}" style="display:inline-block;padding:12px 22px;font-family:${MAIL_FONT};font-size:14px;font-weight:600;` +
    `color:#FFFFFF;text-decoration:none;border-radius:8px;">${esc(text)}</a>` +
    '</td></tr></table>'
  );
}

/** Two-column key/value rows. */
function detailRows(rows: Meta): string {
  const body = Object.entries(rows)
    .map(
      ([k, v]) =>
        '<tr>' +
        `<td style="padding:6px 16px 6px 0;color:${MAIL_MUTED};white-space:nowrap;vertical-align:top;width:96px;">${esc(k)}</td>` +
        `<td style="padding:6px 0;color:${MAIL_INK};word-break:break-word;">${esc(v)}</td>` +
        '</tr>',
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">${body}</table>`;
}

/** Numbered "what happens next" steps. */
function steps(items: ReadonlyArray<readonly [string, string]>): string {
  const body = items
    .map(
      ([title, text], i) =>
        '<tr>' +
        '<td style="width:28px;padding:0 0 16px;vertical-align:top;">' +
        `<div style="width:22px;height:22px;line-height:22px;border-radius:11px;background:${MAIL_CANVAS};border:1px solid ${MAIL_RULE};` +
        `text-align:center;font-size:11px;font-weight:600;color:${MAIL_INK};">${i + 1}</div></td>` +
        '<td style="padding:1px 0 16px 10px;vertical-align:top;">' +
        `<p style="margin:0;font-size:14px;font-weight:600;color:${MAIL_INK};">${esc(title)}</p>` +
        `<p style="margin:2px 0 0;font-size:13px;line-height:1.55;color:${MAIL_MUTED};">${esc(text)}</p>` +
        '</td></tr>',
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table>`;
}

function referenceChip(ref: string): string {
  return (
    `<span style="font-family:${MAIL_MONO};font-size:12px;color:${MAIL_INK};background:${MAIL_CANVAS};` +
    `border:1px solid ${MAIL_RULE};border-radius:6px;padding:3px 8px;">${esc(ref)}</span>`
  );
}

/* ── Internal notification (to the team) ─────────────────────────────────── */

export function renderHtmlBody(name: string, email: string, message: string, meta: Meta, ref: string): string {
  const replyHref = `mailto:${email}?subject=${encodeURIComponent(`Re: Your enquiry [${ref}]`)}`;

  const inner =
    label(`New enquiry · ${ref}`) +
    heading(`${esc(name)} wants to talk`) +
    paragraph(`<a href="mailto:${esc(email)}" style="color:${MAIL_INK};text-decoration:underline;">${esc(email)}</a>`, 'margin-bottom:24px;') +
    label('Message') +
    quote(message) +
    button(replyHref, `Reply to ${firstName(name)}`) +
    paragraph(`Or just hit Reply — it goes straight to ${esc(email)}.`, `margin:12px 0 0;font-size:13px;color:${MAIL_MUTED};`) +
    rule() +
    label('Details') +
    detailRows({ Reference: ref, ...meta });

  return mailShell(
    `New enquiry from ${name}`,
    `${firstName(name)}: ${message.replace(/\s+/g, ' ').slice(0, 110)}`,
    inner,
    'Sent by the contact form on kapidhwajinnovations.com. The visitor received an automatic confirmation.',
  );
}

export function renderTextBody(name: string, email: string, message: string, meta: Meta, ref: string): string {
  const details = Object.entries(meta)
    .map(([k, v]) => `${k}: ${v}\n`)
    .join('');
  return (
    `New enquiry · ${ref}\n\n${name} <${email}>\n\nMessage\n-------\n${message}\n\n` +
    `Reply to this email to answer ${name} directly.\n\nDetails\n-------\nReference: ${ref}\n${details}`
  );
}

/* ── Auto-reply (to the visitor) ─────────────────────────────────────────── */

export function renderAutoReplyHtml(name: string, message: string, ref: string, inbox: string): string {
  const inner =
    heading(`Thanks, ${esc(firstName(name))}. We have your message.`) +
    paragraph(
      `A real person on our team will read it and reply within <strong style="color:${MAIL_INK};">one business day</strong>. ` +
        'You don&rsquo;t need to do anything else.',
    ) +
    paragraph(`Your reference is ${referenceChip(ref)}. Mention it if you follow up.`, 'margin-bottom:28px;') +
    rule() +
    label('What happens next') +
    steps([
      ['We review your note', 'Someone who works on this kind of problem reads it, not a bot.'],
      ['We reply within one business day', 'With a first point of view and any questions we have.'],
      ['We plan the next step together', 'A short call, or straight to a proposal if the scope is clear.'],
    ]) +
    label('Your message') +
    quote(message) +
    paragraph('Want to add something? Reply to this email and it will join the same conversation.', `margin:0;font-size:14px;color:${MAIL_MUTED};`);

  return mailShell(
    'We received your message',
    `We have your message (${ref}) and will reply within one business day.`,
    inner,
    'You are receiving this one-time confirmation because this address was entered in the contact form on kapidhwajinnovations.com. ' +
      'If that wasn&rsquo;t you, you can ignore this email — you won&rsquo;t hear from us again. Questions: ' +
      `<a href="mailto:${esc(inbox)}" style="color:${MAIL_MUTED};text-decoration:underline;">${esc(inbox)}</a>.`,
  );
}

export function renderAutoReplyText(name: string, message: string, ref: string, inbox: string): string {
  return (
    `Thanks, ${firstName(name)}. We have your message.\n\n` +
    'A real person on our team will read it and reply within one business day.\n' +
    `Your reference: ${ref}\n\n` +
    'What happens next\n' +
    '1. We review your note.\n' +
    '2. We reply within one business day.\n' +
    '3. We plan the next step together.\n\n' +
    `Your message\n------------\n${message}\n\n` +
    'Reply to this email to add anything.\n\n' +
    `--\n${MAIL_BRAND} · kapidhwajinnovations.com\n` +
    'You got this one-time confirmation because this address was entered in our contact form. ' +
    `If that wasn't you, ignore this email. Questions: ${inbox}\n`
  );
}
