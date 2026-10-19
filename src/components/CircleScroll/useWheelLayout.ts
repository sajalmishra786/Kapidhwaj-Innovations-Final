import { useLayoutEffect, useState, type RefObject } from 'react';
import {
  defaultLayout,
  solveWheelLayout,
  type CopyLine,
  type WheelLayout,
} from './wheelLayout';

/** The solved layout moves by fractions of a pixel between measurements; ignore that. */
const EPSILON = 0.5;

function sameLayout(a: WheelLayout, b: WheelLayout): boolean {
  return (
    a.compact === b.compact &&
    Math.abs(a.apexY - b.apexY) < EPSILON &&
    Math.abs(a.sparkleY - b.sparkleY) < EPSILON &&
    Math.abs(a.spacingDeg - b.spacingDeg) < EPSILON &&
    Math.abs(a.radiusX - b.radiusX) < EPSILON &&
    Math.abs(a.radiusY - b.radiusY) < EPSILON &&
    Math.abs(a.copyTop - b.copyTop) < EPSILON &&
    Math.abs(a.badgeY - b.badgeY) < EPSILON &&
    Math.abs(a.connectorTop - b.connectorTop) < EPSILON
  );
}

/** Every rendered line of text in `block`, with the block's own height. */
function readCopy(block: HTMLElement): { lines: CopyLine[]; height: number } {
  const box = block.getBoundingClientRect();
  const centreX = box.left + box.width / 2;
  const lines: CopyLine[] = [];

  for (const element of block.querySelectorAll<HTMLElement>('h3, p')) {
    const range = document.createRange();
    range.selectNodeContents(element);

    // A line can come back as several fragments; they share a top, so group on it.
    const byLine = new Map<number, { top: number; left: number; right: number }>();
    for (const rect of range.getClientRects()) {
      if (rect.width < 1) continue;
      const key = Math.round(rect.top / 4);
      const seen = byLine.get(key);
      byLine.set(
        key,
        seen
          ? { top: Math.min(seen.top, rect.top), left: Math.min(seen.left, rect.left), right: Math.max(seen.right, rect.right) }
          : { top: rect.top, left: rect.left, right: rect.right },
      );
    }

    for (const line of byLine.values()) {
      lines.push({ y: line.top - box.top, halfWidth: Math.max(centreX - line.left, line.right - centreX) });
    }
  }

  return { lines, height: box.height };
}

/**
 * Solves the wheel's geometry from the stage's size and the real copy.
 *
 * `probeRef` is a hidden element holding every step's copy, laid out exactly as
 * the visible copy is. The arc is static while the steps change, so it has to
 * clear the *worst* line of *any* step, not just the one on screen. Measured in a
 * layout effect, so the first paint already has the right geometry; it is
 * re-solved when the stage resizes and once the web fonts have loaded (they
 * change line widths).
 */
export function useWheelLayout(
  stageRef: RefObject<HTMLElement | null>,
  probeRef: RefObject<HTMLElement | null>,
  headingRef: RefObject<HTMLElement | null>,
  neighbourDeg: number,
  enabled: boolean,
): WheelLayout {
  const [layout, setLayout] = useState<WheelLayout>(() =>
    typeof window === 'undefined' ? defaultLayout(1440, 900) : defaultLayout(window.innerWidth, window.innerHeight),
  );

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const probe = probeRef.current;
    const headingEl = headingRef.current;
    if (!enabled || !stage || !probe) return;

    const solve = () => {
      const { width, height, left, top } = stage.getBoundingClientRect();
      if (!width || !height) return;

      // the heading's text, not its box: the box can be wider than the words
      let heading: { right: number; bottom: number } | undefined;
      if (headingEl) {
        const range = document.createRange();
        range.selectNodeContents(headingEl);
        const text = range.getBoundingClientRect();
        heading = { right: text.right - left, bottom: text.bottom - top };
      }

      const lines: CopyLine[] = [];
      let copyHeight = 0;
      for (const block of probe.children) {
        const copy = readCopy(block as HTMLElement);
        lines.push(...copy.lines);
        copyHeight = Math.max(copyHeight, copy.height);
      }

      const next = solveWheelLayout({ width, height, lines, copyHeight, neighbourDeg, heading });
      setLayout((current) => (sameLayout(current, next) ? current : next));
    };

    let mounted = true;
    solve();
    const observer = new ResizeObserver(solve);
    observer.observe(stage);
    // the heading's block can change size without the stage doing so (the eyebrow above it
    // is dropped on the shortest phones), and the stack on a phone starts under it
    if (headingEl?.parentElement) observer.observe(headingEl.parentElement);
    void document.fonts?.ready.then(() => mounted && solve());

    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [stageRef, probeRef, headingRef, neighbourDeg, enabled]);

  return layout;
}
