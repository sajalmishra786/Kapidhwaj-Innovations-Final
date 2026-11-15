import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/** Marks each card's content column so the check can find it. */
export const STACK_CONTENT_ATTR = 'data-stack-content';

/** Overflow below this many pixels is sub-pixel rounding, not clipped content. */
const OVERFLOW_TOLERANCE = 1;

interface ViewportKey {
  width: number;
  svh: number;
}

/**
 * The small-viewport height (100svh) in px. Unlike `innerHeight` it does not
 * change while iOS Safari's toolbars collapse and expand during a scroll, so it
 * is safe to key a layout decision on without flip-flopping mid-scroll.
 */
function readViewport(probe: HTMLElement | null): ViewportKey {
  return {
    width: document.documentElement.clientWidth,
    svh: probe?.getBoundingClientRect().height || window.innerHeight,
  };
}

/**
 * Whether a card's copy runs past the visible part of the card.
 *
 * The column grows with its content (its grid row is auto-sized), so the clip
 * happens one level up: the padded grid sits in the card body, which is
 * `overflow: hidden`. The check is therefore "content bottom vs the body's
 * bottom edge minus the grid's bottom padding".
 *
 * The content bottom comes from layout offsets, not rects or `scrollHeight`:
 * the entrance animation starts every line translated 32px down, and transforms
 * would make every card look overflowing before it had animated in. (The column
 * is `position: relative`, so it is its children's offsetParent, and it carries
 * no transform of its own.)
 */
function columnOverflows(col: HTMLElement): boolean {
  const grid = col.parentElement;
  const clip = grid?.parentElement;
  if (!grid || !clip) return false;

  const children = Array.from(col.children) as HTMLElement[];
  const contentBottom =
    col.getBoundingClientRect().top + Math.max(0, ...children.map((c) => c.offsetTop + c.offsetHeight));
  const visibleBottom =
    clip.getBoundingClientRect().bottom - parseFloat(getComputedStyle(grid).paddingBottom || '0');

  return contentBottom - visibleBottom > OVERFLOW_TOLERANCE;
}

function anyCardOverflows(root: HTMLElement): boolean {
  const columns = root.querySelectorAll<HTMLElement>(`[${STACK_CONTENT_ATTR}]`);
  return Array.from(columns).some(columnOverflows);
}

/**
 * Decides whether the pinned card stack fits this screen.
 *
 * Each pinned card has a height derived from the viewport, so on a short phone
 * (an iPhone SE / mini in Safari with its toolbars showing leaves ~550px) the
 * longer services spill past the card and their chips are clipped. The stack
 * renders pinned first; this measures every card before paint and, if any
 * overflows, reports `false` so the caller can fall back to the natural-height
 * list. It re-tries the pinned layout only when the width or small-viewport
 * height actually changes (rotation, window resize), and after web fonts load.
 *
 * @param rootRef     container holding the pinned cards
 * @param probeRef    a hidden element sized `100svh`, used to read the viewport
 * @param enabled     false skips measuring (e.g. reduced-motion layout)
 */
export function useStackFits(
  rootRef: RefObject<HTMLElement | null>,
  probeRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): boolean {
  const [fits, setFits] = useState(true);
  /** Viewport at which the stack last failed to fit. */
  const failedAt = useRef<ViewportKey | null>(null);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    if (anyCardOverflows(root)) {
      failedAt.current = readViewport(probeRef.current);
      setFits(false);
    }
  }, [rootRef, probeRef]);

  // Measure synchronously after the pinned layout commits, before paint, so a
  // phone that cannot fit it never sees a clipped frame.
  useLayoutEffect(() => {
    if (enabled && fits) measure();
  }, [enabled, fits, measure]);

  useEffect(() => {
    if (!enabled) return;

    const onResize = () => {
      const now = readViewport(probeRef.current);
      const prev = failedAt.current;
      if (!prev) {
        measure();
        return;
      }
      // Only a real change in available space is worth re-trying the stack.
      if (now.width !== prev.width || Math.abs(now.svh - prev.svh) > OVERFLOW_TOLERANCE) {
        failedAt.current = null;
        setFits(true);
      }
    };

    window.addEventListener('resize', onResize);
    // Text metrics change when the web fonts swap in.
    document.fonts?.ready.then(() => {
      if (!failedAt.current) measure();
    }).catch(() => {
      /* font loading failure leaves the fallback fonts measured — nothing to do */
    });

    return () => window.removeEventListener('resize', onResize);
  }, [enabled, measure, probeRef]);

  return fits;
}
