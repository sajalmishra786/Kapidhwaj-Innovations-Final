import { useEffect, useState } from 'react';

/**
 * Tracks which section id is currently active in the viewport. The section
 * whose box contains the vertical centre of the screen wins; otherwise the one
 * whose top is closest to centre. Drives the navbar active-indicator.
 *
 * Reads are coalesced into a single requestAnimationFrame per frame so the
 * measurement (getBoundingClientRect on every section) runs at most once per
 * paint — Lenis fires many scroll events per frame, and an un-throttled handler
 * would force a layout reflow on each one.
 *
 * @param ids ordered list of section element ids to observe.
 */
export function useSectionTracker(ids: string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      let currentActive = ids[0];
      let minDistance = Infinity;
      const centerY = window.innerHeight / 2;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        // The section straddling screen-centre wins outright.
        if (rect.top <= centerY && rect.bottom >= centerY) {
          currentActive = id;
          break;
        }

        // Otherwise track the section whose top sits nearest to centre.
        const distance = Math.abs(rect.top - centerY);
        if (distance < minDistance) {
          minDistance = distance;
          currentActive = id;
        }
      }

      if (currentActive) setActive(currentActive);
    };

    // Coalesce bursts of scroll events into one measurement per frame.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    measure(); // initial state on mount

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids.join(',')]);

  return active;
}
