import { useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { FiRotateCcw } from 'react-icons/fi';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SentConfirmationProps {
  firstName: string;
  email: string;
  /** Reference returned by the API (e.g. KI-261115-3F9A). Optional for older servers. */
  reference?: string;
  onReset: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** Beats of the sequence, in seconds. Circle → tick → copy → timeline. */
const T = {
  circle: 0.05,
  tick: 0.45,
  copy: 0.7,
  steps: 1.05,
} as const;

const STEPS = [
  { title: 'Message received', body: 'Delivered to our inbox just now.' },
  { title: 'Reviewed by our team', body: 'A real person reads it, not a bot.' },
  { title: 'Reply within 1 business day', body: 'Check your inbox, and spam just in case.' },
] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
};

/**
 * Success state for the contact form: a drawn check, a one-time ripple,
 * then the copy and a "what happens next" timeline rise in sequence.
 * With reduced motion everything appears at once, without movement.
 */
export function SentConfirmation({ firstName, email, reference, onReset }: SentConfirmationProps) {
  const reduced = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the heading so keyboard and screen-reader users land on the result.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const d = (s: number) => (reduced ? 0 : s);
  const draw = (delay: number, duration: number) =>
    reduced
      ? { pathLength: { duration: 0 }, opacity: { duration: 0 } }
      : { pathLength: { duration, ease: EASE, delay }, opacity: { duration: 0.01, delay } };

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
      className="flex min-h-[22rem] flex-col items-center justify-center py-4 text-center"
    >
      {/* Mark: ripple + drawn circle + drawn tick. Decorative. */}
      <div className="relative h-20 w-20" aria-hidden>
        {!reduced && (
          <motion.span
            className="absolute inset-0 rounded-full bg-accent-coral/25"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.9], opacity: [0, 0.55, 0] }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: T.tick + 0.15, times: [0, 0.2, 1] }}
          />
        )}
        <motion.span
          className="absolute inset-0 rounded-full bg-accent-coral/10"
          initial={{ scale: reduced ? 1 : 0.4 }}
          animate={{ scale: 1 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 18, delay: T.circle }}
        />
        <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
          <motion.circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-accent-coral"
            initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={draw(T.circle, 0.6)}
          />
        </svg>
        <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full">
          <motion.path
            d="M27 41.5 36 50 54 31"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-coral"
            initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={draw(T.tick, 0.4)}
          />
        </svg>
      </div>

      <motion.h3
        ref={headingRef}
        tabIndex={-1}
        variants={rise}
        initial="hidden"
        animate="visible"
        custom={d(T.copy)}
        className="mt-7 text-2xl font-semibold text-cream-100 outline-none"
      >
        Message sent
      </motion.h3>

      <motion.p
        variants={rise}
        initial="hidden"
        animate="visible"
        custom={d(T.copy + 0.08)}
        className="mt-2 max-w-sm text-cream-100/60"
      >
        Thanks, {firstName}. A confirmation is on its way to{' '}
        <span className="text-cream-100/85">{email}</span>.
      </motion.p>

      {reference && (
        <motion.p
          variants={rise}
          initial="hidden"
          animate="visible"
          custom={d(T.copy + 0.16)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-cream-100/10 px-3 py-1 font-mono text-xs text-cream-100/60"
        >
          <span className="text-cream-100/40">Ref</span>
          <span className="text-cream-100/85">{reference}</span>
        </motion.p>
      )}

      <Timeline startAt={d(T.steps)} reduced={reduced} />

      <motion.button
        type="button"
        onClick={onReset}
        variants={rise}
        initial="hidden"
        animate="visible"
        custom={d(T.steps + 0.5)}
        className="mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-cream-100/55 transition-colors hover:bg-cream-100/5 hover:text-cream-100/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-coral"
      >
        <FiRotateCcw className="text-xs" />
        Send another message
      </motion.button>
    </motion.div>
  );
}

interface TimelineProps {
  startAt: number;
  reduced: boolean;
}

/** Three-step "what happens next". Step one is done; the rest are pending. */
function Timeline({ startAt, reduced }: TimelineProps) {
  return (
    <ol className="mt-8 w-full max-w-xs text-left" aria-label="What happens next">
      {STEPS.map((step, i) => {
        const done = i === 0;
        const delay = reduced ? 0 : startAt + i * 0.12;
        const last = i === STEPS.length - 1;
        return (
          <motion.li
            key={step.title}
            variants={rise}
            initial="hidden"
            animate="visible"
            custom={delay}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {!last && (
              <motion.span
                aria-hidden
                className="absolute left-[7px] top-5 h-[calc(100%-1rem)] w-px origin-top bg-cream-100/15"
                initial={{ scaleY: reduced ? 1 : 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: reduced ? 0 : 0.4, ease: EASE, delay: delay + 0.15 }}
              />
            )}
            <span
              aria-hidden
              className={
                done
                  ? 'relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full bg-accent-coral shadow-[0_0_0_4px_rgba(224,121,94,0.15)]'
                  : 'relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border border-cream-100/25'
              }
            />
            <span>
              <span className={`block text-sm font-medium ${done ? 'text-cream-100' : 'text-cream-100/70'}`}>
                {step.title}
                <span className="sr-only">{done ? ' (done)' : ' (next)'}</span>
              </span>
              <span className="block text-xs text-cream-100/45">{step.body}</span>
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
}
