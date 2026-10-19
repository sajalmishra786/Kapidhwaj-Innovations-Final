import { Fragment, useRef, type CSSProperties, type ElementType } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface RevealSegment {
  /** A run of text that shares one style (e.g. a gradient accent word). */
  text: string;
  /** Extra classes applied to every word in this segment. */
  className?: string;
  /** Start this segment on its own line. */
  break?: boolean;
}

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span';

interface ScrollRevealTextProps {
  segments: RevealSegment[];
  as?: Tag;
  className?: string;
  style?: CSSProperties;
  /** Opacity of words that scrolling hasn't reached yet (the "ghost" state). */
  from?: number;
  /** How far each word's reveal window overlaps its neighbours — higher = softer wipe. */
  overlap?: number;
  /** framer `useScroll` offset controlling when the reveal starts and finishes. */
  offset?: [string, string];
}

const DEFAULT_OFFSET: [string, string] = ['start 0.9', 'start 0.4'];

/**
 * Scroll-progress-driven heading reveal. Each word fades from a faint ghost to
 * full ink as the heading travels up the viewport, left-to-right. The raw scroll
 * value is spring-smoothed and the per-word windows overlap, so the wipe reads as
 * one continuous, buttery motion rather than discrete word pops. Pure opacity —
 * compositor-friendly and crisp. Honours prefers-reduced-motion by rendering the
 * text statically at full strength.
 */
export function ScrollRevealText({
  segments,
  as = 'h2',
  className,
  style,
  from = 0.12,
  overlap = 2,
  offset,
}: ScrollRevealTextProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const MotionTag = motion[as] as ElementType;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (offset ?? DEFAULT_OFFSET) as never,
  });
  // Spring-smooth the raw scroll so the wipe never feels mechanical or steppy.
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    restDelta: 0.0008,
  });

  const label = segments.map((s) => s.text).join(' ');

  // Flatten segments → words, remembering per-word styling + line breaks so the
  // reveal order is a single left-to-right, top-to-bottom sweep across the phrase.
  const words = segments.flatMap((seg, si) =>
    seg.text
      .trim()
      .split(/\s+/)
      .map((word, wi) => ({
        word,
        className: seg.className,
        newLine: Boolean(seg.break) && si > 0 && wi === 0,
      })),
  );
  const total = words.length;

  if (reduced) {
    return (
      <MotionTag ref={ref} className={className} style={style}>
        {segments.map((seg, i) => (
          <Fragment key={i}>
            {seg.break && i > 0 ? <br /> : i > 0 ? ' ' : null}
            <span className={seg.className}>{seg.text}</span>
          </Fragment>
        ))}
      </MotionTag>
    );
  }

  return (
    <MotionTag ref={ref} className={className} style={style} aria-label={label}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {w.newLine && <br aria-hidden />}
          <RevealWord
            progress={progress}
            index={i}
            total={total}
            from={from}
            overlap={overlap}
            className={w.className}
          >
            {w.word}
          </RevealWord>
        </Fragment>
      ))}
    </MotionTag>
  );
}

interface RevealWordProps {
  progress: MotionValue<number>;
  index: number;
  total: number;
  from: number;
  overlap: number;
  className?: string;
  children: string;
}

/** One word. Owns its slice of the scroll: a per-index window (widened by
 *  `overlap` so neighbours cross-fade) maps progress → opacity. */
function RevealWord({ progress, index, total, from, overlap, className, children }: RevealWordProps) {
  const step = 1 / total;
  const start = index * step;
  const end = Math.min(1, start + step * overlap);
  const opacity = useTransform(progress, [start, end], [from, 1], { clamp: true });

  return (
    <span className="mr-[0.25em] inline-block">
      <motion.span
        aria-hidden
        style={{ opacity }}
        className={cn('inline-block will-change-[opacity]', className)}
      >
        {children}
      </motion.span>
    </span>
  );
}
