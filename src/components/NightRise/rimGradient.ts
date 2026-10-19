/** The dark chapter's surface — the same warm near-black the wheel is drawn on. */
export const NIGHT = '#1A1714';
const NIGHT_RGB = '26, 23, 20';

/** A stop every 2% of the rim — fine enough that the corners between stops cannot be seen. */
const STEPS = 48;

const smootherstep = (t: number): number => t * t * t * (t * (6 * t - 15) + 10);

/**
 * The dome as a radial gradient whose centre is the bottom edge of its box, so
 * the ellipse's top sits on the box's top edge and its lower half is left to the
 * solid body beneath.
 *
 * `core` is how far out (as % of the radius) the fill stays fully opaque; the
 * remaining `100 - core` is the soft rim, the same dark fading to nothing. Alpha
 * follows a smootherstep, so it leaves the core and reaches the outside with zero
 * slope — no corner for the eye to pick out as a line.
 */
export function buildDomeGradient(core: number, rx: string, ry: string): string {
  const span = 100 - core;

  const stops = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    const alpha = 1 - smootherstep(t);
    return `rgba(${NIGHT_RGB}, ${alpha.toFixed(3)}) ${(core + span * t).toFixed(2)}%`;
  });

  return `radial-gradient(${rx} ${ry} at 50% 100%, ${NIGHT} 0%, ${stops.join(', ')})`;
}
