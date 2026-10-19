import type { RefObject } from 'react';
import { useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Scale of the sheet, and everything on it, as it first rises into view. Fitted to the
 * reference frames, which read 0.87 / 0.92 / 0.97 / 1.0 with the sheet's top edge at
 * 81% / 58% / 37% / 14% of the screen: a straight line from here at the bottom edge.
 */
const SCALE_START = 0.85;

/**
 * Scroll-linked scale for the footer sheet. The whole sheet — links, icons, wordmark —
 * grows together from the top edge, so the text expands in step with the sheet instead of
 * sitting at full size inside a widening window.
 *
 * A transform, so it stays off the layout path: the box never changes size, it is only
 * drawn smaller. Reduced-motion users get the settled size straight away.
 */
export function useSheetScale(target: RefObject<HTMLElement | null>): MotionValue<number> {
  const reduced = useReducedMotion();

  // Full size once the sheet's top reaches 14% of the viewport…
  const { scrollYProgress: toReadingLine } = useScroll({ target, offset: ['start end', 'start 14%'] });
  // …but on a tall viewport the sheet may never climb that high before the page ends,
  // so this one reaches 1 exactly at the bottom of the page whatever the viewport.
  const { scrollYProgress: toPageEnd } = useScroll({ target, offset: ['start end', 'end end'] });
  const progress = useTransform([toReadingLine, toPageEnd], ([reading, end]: number[]) =>
    Math.max(reading, end),
  );

  return useTransform(progress, [0, 1], [reduced ? 1 : SCALE_START, 1]);
}
