import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** How far past a boundary (in steps) scrolling must go before the step flips — either way. */
const HYSTERESIS = 0.035;
/** Least time between two step changes, so transitions never pile up. */
const MIN_DWELL_MS = 420;
const JUMP_SECONDS = 1.3;
/** Fallback if a jump never reports completion (e.g. the user grabs the scroll). */
const JUMP_TIMEOUT_MS = 2400;
/** A button press closer than this to its target is already there. */
const MIN_JUMP_PX = 2;

/**
 * Which step to show for a scroll `position` measured in steps (0 → total).
 * The current step holds a little past each edge, so a wobble of a few pixels
 * at a boundary can't flip it back and forth.
 */
export function nextStep(current: number, position: number, total: number): number {
  if (position >= current + 1 + HYSTERESIS) {
    return Math.min(total - 1, Math.floor(position - HYSTERESIS));
  }
  if (position < current - HYSTERESIS) {
    return Math.max(0, Math.floor(position + HYSTERESIS));
  }
  return current;
}

interface StepProgress {
  activeStep: number;
  scrollToStep: (index: number) => void;
}

/**
 * Turns the pinned section's scroll position into the active step.
 *
 * Changes are rate-limited to one per `MIN_DWELL_MS`, and are held back
 * entirely while a button-driven jump is in flight — the content then changes
 * once, on arrival, instead of flashing through every step on the way.
 */
export function useStepProgress(containerRef: RefObject<HTMLElement | null>, total: number): StepProgress {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const [activeStep, setActiveStep] = useState(0);

  const shown = useRef(0);
  const position = useRef(0);
  const lastChangeAt = useRef(0);
  const dwellTimer = useRef<number | undefined>(undefined);
  const jumpTimer = useRef<number | undefined>(undefined);
  const isJumping = useRef(false);

  const commit = useCallback((index: number) => {
    window.clearTimeout(dwellTimer.current);
    dwellTimer.current = undefined;
    if (index === shown.current) return;

    shown.current = index;
    lastChangeAt.current = performance.now();
    setActiveStep(index);
  }, []);

  const settle = useCallback(() => {
    if (isJumping.current) return;

    const candidate = nextStep(shown.current, position.current, total);
    if (candidate === shown.current) {
      window.clearTimeout(dwellTimer.current);
      dwellTimer.current = undefined;
      return;
    }

    const wait = MIN_DWELL_MS - (performance.now() - lastChangeAt.current);
    if (wait <= 0) {
      commit(candidate);
    } else if (dwellTimer.current === undefined) {
      dwellTimer.current = window.setTimeout(() => {
        dwellTimer.current = undefined;
        settle();
      }, wait);
    }
  }, [commit, total]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    position.current = latest * total;
    settle();
  });

  useEffect(
    () => () => {
      window.clearTimeout(dwellTimer.current);
      window.clearTimeout(jumpTimer.current);
    },
    [],
  );

  const scrollToStep = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;

      // The pinned stage only travels (section height − one screen) while progress
      // runs 0 → 1; aim for the middle of this step's share of that distance.
      const { top, height } = container.getBoundingClientRect();
      const target = window.scrollY + top + ((index + 0.5) / total) * (height - window.innerHeight);

      // Already there: nothing will scroll, so nothing would report arrival.
      if (Math.abs(target - window.scrollY) < MIN_JUMP_PX) return;

      const arrive = () => {
        window.clearTimeout(jumpTimer.current);
        if (!isJumping.current) return;
        isJumping.current = false;
        commit(nextStep(shown.current, position.current, total));
      };

      isJumping.current = true;
      window.clearTimeout(jumpTimer.current);
      jumpTimer.current = window.setTimeout(arrive, JUMP_TIMEOUT_MS);

      if (window.__lenis) {
        window.__lenis.scrollTo(target, { duration: JUMP_SECONDS, onComplete: arrive });
      } else {
        window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
        // Native smooth scroll has no completion callback; the timeout above ends the jump.
      }
    },
    [commit, containerRef, reduced, total],
  );

  return { activeStep, scrollToStep };
}
