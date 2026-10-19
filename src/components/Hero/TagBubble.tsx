import { motion } from 'framer-motion';
import type { HeroBubble } from '@/data/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { HERO_TIMING } from './heroMotion';

const TONES: Record<HeroBubble['tone'], string> = {
  blue: 'bg-[#3E5BFF]',
  green: 'bg-[#2FA57A]',
};

const FLOAT_DISTANCE = 5;
/** The two bubbles bob on different beats so they never move in lockstep. */
const FLOAT_SECONDS = { left: 3.6, right: 4.4 } as const;
const FLOAT_DELAY_SECONDS = { left: 0, right: 0.9 } as const;

interface TagBubbleProps extends HeroBubble {
  /** Which corner of the card the bubble hangs from — and which way its tail points. */
  side: 'left' | 'right';
}

/**
 * A chat-style speech bubble pinned to a card. It pops in once the fan has
 * settled, then bobs gently. Static under reduced motion.
 */
export function TagBubble({ text, tone, side }: TagBubbleProps) {
  const reduced = useReducedMotion();
  const isLeft = side === 'left';

  return (
    <motion.div
      initial={reduced ? false : { scale: 0, opacity: 0, rotate: isLeft ? -12 : 12 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: HERO_TIMING.bubbles }}
      style={{ transformOrigin: isLeft ? 'bottom left' : 'bottom right' }}
      className={cn('absolute -top-10 z-10', isLeft ? 'left-1' : 'right-1')}
    >
      <motion.span
        animate={reduced ? undefined : { y: [0, -FLOAT_DISTANCE, 0] }}
        transition={{
          duration: FLOAT_SECONDS[side],
          delay: FLOAT_DELAY_SECONDS[side],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn(
          'relative block whitespace-nowrap rounded-2xl px-3.5 py-1.5 text-[0.7rem] font-medium tracking-tight text-white shadow-[0_10px_22px_-10px_rgba(23,21,15,0.5)] sm:text-sm',
          TONES[tone],
        )}
      >
        {text}
        <span
          aria-hidden
          className={cn(
            'absolute -bottom-1 h-3 w-3 rotate-45 rounded-[3px] bg-inherit',
            isLeft ? 'left-4' : 'right-4',
          )}
        />
      </motion.span>
    </motion.div>
  );
}
