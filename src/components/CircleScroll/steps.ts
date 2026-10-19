/**
 * Which step the scroll position is on.
 *
 * Pure functions — no DOM — so the maths can be tested on its own.
 */

/**
 * Scroll travel given to each step, in `svh`: one screen per number. At a third of
 * that a single trackpad flick covered two or three steps; a screen is about what
 * one deliberate gesture travels.
 */
export const SCROLL_PER_STEP = 100;

/**
 * How far past a step's edge, as a share of a step, the scroll must go before the
 * step changes. Without it, resting on an edge flips the number back and forth with
 * every pixel of smooth-scroll overshoot.
 */
export const STEP_HYSTERESIS = 0.12;

/** Height of the scroll track for `total` steps and the pinned screen they are shown on, in `svh`. */
export function trackHeight(total: number): number {
  return 100 + total * SCROLL_PER_STEP;
}

/**
 * The step that scroll `progress` (0 to 1 across the whole track) lands on. `current`
 * is the step it is on now: that step is kept until the scroll has gone past its
 * edge by `STEP_HYSTERESIS`, in either direction.
 */
export function stepFromProgress(progress: number, current: number, total: number): number {
  const last = total - 1;
  const clamp = (step: number) => Math.min(last, Math.max(0, step));
  const position = progress * total;

  if (position >= current + 1 + STEP_HYSTERESIS) return clamp(Math.floor(position - STEP_HYSTERESIS));
  if (position < current - STEP_HYSTERESIS) return clamp(Math.floor(position + STEP_HYSTERESIS));
  return current;
}
