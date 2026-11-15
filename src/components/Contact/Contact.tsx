import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import { FloatingField } from './FloatingField';
import { SentConfirmation } from './SentConfirmation';
import { SendButton } from './SendButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ScrollRevealText } from '@/components/ui/ScrollRevealText';
import { fadeUp, inView } from '@/animations/motionVariants';
import { CONTACT_EMAIL } from '@/data/site';

interface FormState {
  name: string;
  email: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;
/** `finishing` is the short "Sent ✓" beat on the button before the success panel. */
type Status = 'idle' | 'sending' | 'finishing' | 'sent' | 'error';

/** How long the button holds its completed "Sent" state before the panel swaps in. */
const FINISH_BEAT_MS = 650;

/** Shape returned by api/send.php. */
interface ApiResponse {
  ok: boolean;
  message?: string;
  errors?: Errors;
  /** Human-readable reference for the enquiry, e.g. KI-261115-3F9A. */
  reference?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Endpoint the form posts to. Defaults to the PHP relay that ships in `api/`.
 * Override with VITE_CONTACT_ENDPOINT if the API lives on another host.
 * In `npm run dev`, vite.config.ts proxies /api to a local PHP server.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/send.php';

const INBOX = CONTACT_EMAIL;

/**
 * Name of the hidden bot-trap field. Deliberately meaningless: it used to be
 * `company`, and browsers autofill "company/organization" fields regardless of
 * `autocomplete="off"`, so real visitors filled the trap without seeing it and
 * their message was discarded with a fake "sent". Must match api/send.php.
 */
const HONEYPOT_FIELD = 'kd_hp_7f3';

const EMPTY_FORM: FormState = { name: '', email: '', message: '' };

/** Modern contact section with floating fields and a validated submit. */
export function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [reference, setReference] = useState<string | undefined>();
  const reduced = useReducedMotion();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [notice, setNotice] = useState('');
  /** Honeypot. Bots fill hidden inputs; humans never see this one. */
  const honeypot = useRef<HTMLInputElement>(null);

  const update = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (status === 'error') setStatus('idle');
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'Please tell us your name.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) next.message = 'A little more detail helps.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending' || status === 'finishing') return;
    if (!validate()) return;

    setStatus('sending');
    setNotice('');

    // Give up rather than spin forever if the server never answers.
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 20000);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, [HONEYPOT_FIELD]: honeypot.current?.value ?? '' }),
        signal: abort.signal,
      });

      // A misconfigured server can answer 200 with an HTML error page, so parse
      // defensively instead of trusting the status code alone.
      let data: ApiResponse | null = null;
      try {
        data = (await res.json()) as ApiResponse;
      } catch {
        data = null;
      }

      if (res.ok && data?.ok) {
        setReference(typeof data.reference === 'string' ? data.reference : undefined);
        // Let the button complete its fill and show "Sent ✓" before the panel swaps in.
        if (reduced) {
          setStatus('sent');
        } else {
          setStatus('finishing');
          window.setTimeout(() => setStatus('sent'), FINISH_BEAT_MS);
        }
        return;
      }

      // 422 — the server re-ran validation and rejected specific fields.
      if (data?.errors && Object.keys(data.errors).length > 0) {
        setErrors(data.errors);
        setStatus('idle');
        setNotice(data.message || 'Please check the fields above.');
        return;
      }

      setStatus('error');
      setNotice(
        data?.message ||
          `Something went wrong on our end. Please email us directly at ${INBOX}.`,
      );
    } catch (err) {
      setStatus('error');
      setNotice(
        (err as Error)?.name === 'AbortError'
          ? 'That took too long. Check your connection and try again.'
          : `We could not reach the server. Please email us directly at ${INBOX}.`,
      );
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const sending = status === 'sending' || status === 'finishing';

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setNotice('');
    setReference(undefined);
    setStatus('idle');
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:gap-20">
      <div className="flex flex-col justify-center">
        <span className="eyebrow">Contact us</span>
        <ScrollRevealText
          as="h2"
          className="mt-5 text-display font-semibold"
          segments={[
            { text: "Let's Build What", className: 'text-cream-100' },
            { text: 'Comes Next.', className: 'text-gradient', break: true },
          ]}
        />
        <p className="mt-6 max-w-md text-cream-100/65 leading-relaxed">
          Every meaningful solution begins with a conversation. Share your objectives, challenges, or ideas, and let's explore what the right technology can make possible.
        </p>
        <a
          href={`mailto:${INBOX}`}
          className="mt-8 w-fit font-mono text-sm text-cream-100/50 transition-colors hover:text-cream-100/80"
        >
          {INBOX}
        </a>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="glass rounded-glass p-6 sm:p-8"
      >
        <AnimatePresence mode="wait">
          {status === 'sent' ? (
            <SentConfirmation
              key="success"
              firstName={form.name.trim().split(/\s+/)[0] || 'friend'}
              email={form.email}
              reference={reference}
              onReset={reset}
            />
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              noValidate
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, y: -12, scale: 0.98, filter: 'blur(4px)', transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }
              }
              className="flex flex-col gap-5"
            >
              {/* Honeypot — off-screen, not tabbable, hidden from assistive tech.
                  The name means nothing to autofill (see HONEYPOT_FIELD), and
                  `new-password` is the one autocomplete value browsers honour as
                  "never fill". The server discards any submission that fills it. */}
              <input
                ref={honeypot}
                type="text"
                name={HONEYPOT_FIELD}
                id={HONEYPOT_FIELD}
                tabIndex={-1}
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                aria-hidden
                className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <FloatingField
                id="name"
                label="Your name"
                value={form.name}
                onChange={update('name')}
                error={errors.name}
                disabled={sending}
                required
              />
              <FloatingField
                id="email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
                disabled={sending}
                required
              />
              <FloatingField
                id="message"
                label="What are you building?"
                value={form.message}
                onChange={update('message')}
                error={errors.message}
                textarea
                disabled={sending}
                required
              />

              {/* Server-level notice: network failure, rate limit, SMTP error.
                  Field-level problems render inside their own FloatingField. */}
              <AnimatePresence>
                {notice && (
                  <motion.p
                    key="notice"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 rounded-xl bg-accent-ember/10 px-4 py-3 text-sm text-accent-ember"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{notice}</span>
                  </motion.p>
                )}
              </AnimatePresence>

              <SendButton
                state={status === 'finishing' ? 'finishing' : status === 'sending' ? 'sending' : 'idle'}
                reduced={reduced}
              />

              {/* Screen-reader announcement for the in-flight state. */}
              <span aria-live="polite" className="sr-only">
                {status === 'sending' ? 'Sending your message' : status === 'finishing' ? 'Message sent' : ''}
              </span>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
