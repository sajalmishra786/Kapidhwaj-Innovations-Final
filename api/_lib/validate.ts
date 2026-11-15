/**
 * Input parsing and validation for the contact form. Mirrors the rules in
 * api/send.php and src/components/Contact/Contact.tsx.
 */

/** Must match HONEYPOT_FIELD in Contact.tsx. */
export const HONEYPOT_FIELD = 'kd_hp_7f3';

export interface ContactInput {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly honeypot: string;
}

export type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

// Close to PHP's FILTER_VALIDATE_EMAIL for real-world addresses.
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

// Control characters are a header-injection vector; tabs/newlines excluded.
const CONTROL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function clean(v: unknown): string {
  return String(v ?? '').replace(CONTROL_RE, '').trim();
}

/** Accepts the JSON body the React form sends, or a classic form POST. */
export function parseBody(raw: string, contentType: string): ContactInput | null {
  let data: Record<string, unknown> | null = null;

  if (contentType.includes('application/x-www-form-urlencoded')) {
    data = Object.fromEntries(new URLSearchParams(raw));
  } else {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        data = parsed as Record<string, unknown>;
      }
    } catch {
      data = null;
    }
  }
  if (!data) return null;

  return {
    name: clean(data.name),
    email: clean(data.email),
    message: String(data.message ?? '').trim(),
    honeypot: clean(data[HONEYPOT_FIELD]),
  };
}

export function validate(input: ContactInput): FieldErrors {
  const errors: FieldErrors = {};
  const nameLen = [...input.name].length;
  const msgLen = [...input.message].length;

  if (nameLen < 2) errors.name = 'Please tell us your name.';
  else if (nameLen > 100) errors.name = 'That name is too long.';

  if (!EMAIL_RE.test(input.email)) errors.email = 'Enter a valid email address.';
  else if (input.email.length > 254) errors.email = 'That email address is too long.';

  if (msgLen < 10) errors.message = 'A little more detail helps.';
  else if (msgLen > 5000) errors.message = 'Please keep it under 5000 characters.';

  return errors;
}
