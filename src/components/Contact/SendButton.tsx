import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiSend } from 'react-icons/fi';
import { spring } from '@/animations/motionVariants';

export type SendState = 'idle' | 'sending' | 'finishing';

interface SendButtonProps {
  state: SendState;
  reduced: boolean;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Labels shown while a send is in flight, keyed by elapsed ms. They follow what
 * the server is really doing (TLS handshake, then handing the message to Gmail),
 * so the wait reads as progress rather than a spinner.
 */
const PHASES = [
  { at: 0, label: 'Sending' },
  { at: 700, label: 'Connecting securely' },
  { at: 1600, label: 'Delivering to our team' },
  { at: 3400, label: 'Almost there' },
] as const;

/** How long the fill takes to creep to its ceiling; a typical send lands inside it. */
const FILL_SECONDS = 5;
/** The fill never claims to be finished until the server says so. */
const FILL_CEILING = 0.9;

/** Which phase label is current, advancing on a timer while `active`. */
function usePhaseLabel(active: boolean): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const timers = PHASES.slice(1).map((phase, i) => window.setTimeout(() => setIndex(i + 1), phase.at));
    return () => timers.forEach(window.clearTimeout);
  }, [active]);

  return PHASES[index].label;
}

/**
 * Submit button for the contact form with a staged sending state: an easing
 * progress fill, phase labels that roll upward, a gently bobbing paper plane,
 * and a short "Sent" beat (fill completes, check pops) before the success panel.
 * Everything animated is transform or opacity; reduced motion keeps the labels
 * and drops the movement.
 */
export function SendButton({ state, reduced }: SendButtonProps) {
  const busy = state !== 'idle';
  const phase = usePhaseLabel(state === 'sending');

  const label = state === 'finishing' ? 'Sent' : state === 'sending' ? phase : 'Send message';

  return (
    <motion.button
      type="submit"
      disabled={busy}
      aria-busy={busy}
      whileHover={busy || reduced ? undefined : { scale: 1.02 }}
      whileTap={busy || reduced ? undefined : { scale: 0.98 }}
      transition={spring}
      className="group relative mt-2 inline-flex min-h-[3.25rem] items-center justify-center overflow-hidden rounded-full px-7 py-4 text-sm font-medium text-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-coral disabled:cursor-progress"
    >
      <span aria-hidden className="absolute inset-0 bg-accent-coral" />

      {/* Progress fill: eases toward 90% while sending, completes on success. A
          deeper coral, so the finished button reads as solid rather than washed
          out (a white tint made the "Sent" state look disabled). */}
      <motion.span
        aria-hidden
        className="absolute inset-0 origin-left bg-ink-950/[0.14]"
        initial={false}
        animate={{ scaleX: state === 'finishing' ? 1 : state === 'sending' ? FILL_CEILING : 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : state === 'sending'
              ? { duration: FILL_SECONDS, ease: [0.3, 0.55, 0.35, 1] }
              : { duration: state === 'finishing' ? 0.3 : 0.2, ease: EASE_OUT }
        }
      />

      {/* Soft shimmer riding the leading edge of the fill. */}
      {state === 'sending' && !reduced && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '400%' }}
          transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
        />
      )}

      <span className="relative z-10 inline-flex items-center gap-2.5">
        {/* Label rolls up as the phase changes; fixed height so the button never jumps. */}
        <span className="relative inline-grid h-5 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              className="whitespace-nowrap leading-5"
              initial={reduced ? { opacity: 0 } : { y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: '-110%', opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.35, ease: EASE_OUT }}
            >
              {label}
              {state === 'sending' && label === 'Almost there' && '…'}
            </motion.span>
          </AnimatePresence>
        </span>

        <ButtonIcon state={state} reduced={reduced} />
      </span>
    </motion.button>
  );
}

function ButtonIcon({ state, reduced }: SendButtonProps) {
  if (state === 'finishing') {
    return (
      <motion.span
        key="check"
        className="inline-flex"
        initial={reduced ? false : { scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      >
        <FiCheck strokeWidth={3} />
      </motion.span>
    );
  }

  if (state === 'sending') {
    return (
      <motion.span
        key="plane"
        className="inline-flex"
        initial={reduced ? false : { x: -4, opacity: 0 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { x: [0, 2, 0], y: [0, -2, 0], rotate: [0, -6, 0], opacity: 1 }
        }
        transition={reduced ? { duration: 0 } : { duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
      >
        <FiSend />
      </motion.span>
    );
  }

  return (
    <FiArrowRight
      aria-hidden
      className="transition-transform duration-300 group-hover:translate-x-1"
    />
  );
}
