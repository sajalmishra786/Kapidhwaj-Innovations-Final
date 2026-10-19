import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle, FiArrowRight, FiCheck, FiLoader } from 'react-icons/fi';
import { FloatingField } from './FloatingField';
import { ScrollRevealText } from '@/components/ui/ScrollRevealText';
import { fadeUp, inView, spring } from '@/animations/motionVariants';
import { CONTACT_EMAIL } from '@/data/site';

interface FormState {
  name: string;
  email: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;
type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Shape returned by api/send.php. */
interface ApiResponse {
  ok: boolean;
  message?: string;
  errors?: Errors;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Endpoint the form posts to. Defaults to the PHP relay that ships in `api/`.
 * Override with VITE_CONTACT_ENDPOINT if the API lives on another host.
 * In `npm run dev`, vite.config.ts proxies /api to Apache so PHP executes.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/send.php';

const INBOX = CONTACT_EMAIL;

/** Modern contact section with floating fields and a validated submit. */
export function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
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
    if (status === 'sending') return;
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
        body: JSON.stringify({ ...form, company: honeypot.current?.value ?? '' }),
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
        setStatus('sent');
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

  const sending = status === 'sending';

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
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              className="flex min-h-[22rem] flex-col items-center justify-center text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-coral/15 text-2xl text-accent-coral">
                <FiCheck />
              </span>
              <h3 className="mt-6 text-2xl font-semibold text-cream-100">Message sent</h3>
              <p className="mt-2 max-w-xs text-cream-100/60">
                Thanks, {form.name.split(' ')[0] || 'friend'}. We'll be in touch shortly —
                a confirmation is on its way to {form.email}.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              noValidate
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              {/* Honeypot — off-screen, not tabbable, ignored by autofill.
                  The server discards any submission that fills it. */}
              <input
                ref={honeypot}
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
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

              <motion.button
                type="submit"
                disabled={sending}
                whileHover={sending ? undefined : { scale: 1.02 }}
                whileTap={sending ? undefined : { scale: 0.98 }}
                transition={spring}
                className="group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-4 text-sm font-medium text-night disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 bg-accent-coral" />
                <span className="relative z-10 inline-flex items-center gap-2">
                  {sending ? (
                    <>
                      Sending
                      <FiLoader className="animate-spin" />
                    </>
                  ) : (
                    <>
                      Send message
                      <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </motion.button>

              {/* Screen-reader announcement for the in-flight state. */}
              <span aria-live="polite" className="sr-only">
                {sending ? 'Sending your message' : ''}
              </span>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
