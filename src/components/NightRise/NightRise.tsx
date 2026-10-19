import { useRef } from 'react';
import { cubicBezier, motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { buildDomeGradient, NIGHT } from './rimGradient';

const DAY = '#FAF8F2'; // cream-100 — the page surface the dome rises out of

/*
  ── The dome ───────────────────────────────────────────────────────────────

  The dark arrives as a very wide ellipse rising from below the fold. Only its top
  limb is ever on screen: a solid body hangs from the ellipse's centre line, so the
  shape has a curved top and no bottom.

  It starts as a hard, flat line and *becomes* the dome, and that is one number:
  the whole element is scaled on Y from a sliver up to full height, about its top
  edge. Squashed, the ellipse is a near-straight edge with a rim only a few pixels
  thick, which reads as a line. Un-squashed, the same rim opens out to its full
  depth and the edge curves away at the sides. Curvature and softness are therefore
  never animated separately and cannot drift out of step — and the whole thing is a
  single composited transform.

  The ellipse is sized in viewport units on both axes, so its proportions don't
  change with the screen. Its half-width is floored at 70svh so that on a phone,
  where 85vw is narrow, the curve doesn't tighten into a steep arch.
*/
const DOME_CORE = 80; // % of the radius that stays fully opaque; the rest is the rim
const DOME = buildDomeGradient(DOME_CORE, 'max(85vw, 70svh)', '100svh');

/**
 * Where the dome sits, as the offset of its top edge from the top of the frame:
 * parked below the bottom edge, and ending far enough up that the rim has cleared
 * the top corners too. The sag at the sides is ~19svh and the rim ~20svh, so
 * -50svh leaves the whole shape above the frame.
 *
 * It starts at 118svh rather than just under the edge (104) because this section
 * rides up under the stepper: the dome rises while the stepper's last card is still
 * leaving. The extra 14svh is clearance for that card, which matters most on a short
 * window, where the card fills more of its frame and a fast flick could otherwise
 * graze it for a frame.
 */
const DOME_Y = ['108svh', '-50svh'] as const;

/** The dome's flattest state: a line, not a lens. */
const FLAT = 0.035;

/**
 * The body scales with the dome, so it is shortest exactly when the dome is flat
 * and still low on the screen, and it has to reach the bottom edge even then.
 * 400svh does, with margin.
 */
const BODY_HEIGHT = '400svh';

/**
 * How far up into the cap the body starts, as % of the cap's height. The cap's
 * opaque core spans at least its bottom 28% across the whole box (the box is never
 * wider than 0.61 of the ellipse's half-width, so even its corners are inside the
 * core there), which leaves 20 safe with room to spare.
 */
const BODY_OVERLAP = 20;

/*
  ── Timeline (share of the section's scroll) ───────────────────────────────

  0.00–0.95  the dome rises; by the end it has cleared the top of the frame
  0.02–0.75  it opens out — flat line → curved, soft-edged dome
  0.95–1.00  minimal hold before handing off to CircleScroll

  The rise is near-linear on purpose, so it tracks the scroll one-to-one and reads
  as attached to the page. Its first control point sits on the diagonal for that;
  the second pulls the finish up so it lands rather than arriving at speed.
*/
const RISE_END = 0.95;
const RISE_EASE = cubicBezier(0.3, 0.3, 0.6, 1);
// Slow to leave the flat line, so the opening reads as a horizon rising, not a bulge.
const OPEN_EASE = cubicBezier(0.55, 0, 0.35, 1);

/** Pinned for 160svh — tight scroll for the dome rise, minimal dwell. */
const TRACK_HEIGHT = '160svh';

/**
 * Light → dark hand-off. A hard line rises from the bottom of the cream page,
 * opens into a curved, soft-edged dome and fills the frame with the colour the
 * rest of the page is built on. Scroll-driven in both directions: scrolling back
 * up plays it in reverse, frame for frame.
 *
 * Every animated property is `transform` or `opacity`.
 */
export function NightRise() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  /*
    The dome is driven straight off scroll position, with no spring in between.
    Lenis already eases the scroll itself, so a second smoother here only made the
    dome trail the page — and that trailing is what broke the section above it. The
    stepper is laid out in the document and moves with the scroll exactly; a dome
    that follows through a spring does not. Scrolling up quickly, the page was back
    at the stepper while the dome was still up near the top of the screen, drawn
    behind the card (741px apart at the same scroll position, measured). Mapped
    directly, the dome is a pure function of where the page is: the same place on the
    way down and the way up, at any speed.
  */
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const domeY = useTransform(p, [0, RISE_END], [...DOME_Y], { clamp: true, ease: RISE_EASE });
  const domeOpen = useTransform(p, [0.02, 0.75], [FLAT, 1], { clamp: true, ease: OPEN_EASE });



  if (reduced) return <StaticNight />;

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        height: TRACK_HEIGHT,
        background: DAY,
        // Rides up under the stepper's last screen, which is the same cream, so the
        // dome is already climbing while the card scrolls away. At 14svh the card
        // had left long before the dome showed, and about 80svh of scroll was bare
        // cream. The stepper sits above this (z-10), so the card stays in front; the
        // dome clears the card's bottom edge before reaching it at any screen size.
        marginTop: '-30svh',
      }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: DAY }}>
        {/* Centring is on this static wrapper: Framer writes one `transform` per
            element, and would overwrite a centring translate on the same node. */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 w-[104vw] -translate-x-1/2">
          <motion.div
            className="relative origin-top will-change-transform"
            style={{ y: domeY, scaleY: domeOpen }}
          >
            <div className="h-[100svh]" style={{ background: DOME }} />
            {/* Starts inside the cap, not at its edge. Both are scaled by the same Y
                factor, so a fixed overlap shrinks with it — a 1px one is 0.04px when
                the dome is a line, and the two anti-aliased edges leave a hairline.
                A share of the cap's own height scales with it, and is safe because
                the bottom fifth of the cap is solid at every width (see BODY_OVERLAP). */}
            <div
              className="absolute inset-x-0"
              style={{ top: `${100 - BODY_OVERLAP}%`, height: BODY_HEIGHT, background: NIGHT }}
            />
          </motion.div>
        </div>



        {/* Grain over the lot: the rim is a very smooth ramp, which is where 8-bit
            banding shows. Same filter and strength as the wheel it hands off to, so
            the texture doesn't change at the seam. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-soft-light"
        >
          <filter id="night-rise-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#night-rise-grain)" />
        </svg>
      </div>
    </div>
  );
}



/** Reduced motion: the finished shape, with nothing moving. */
function StaticNight() {
  return (
    <div style={{ background: DAY }}>
      <div aria-hidden className="relative h-[36svh] overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[100svh] w-[104vw] origin-top -translate-x-1/2 scale-y-[0.36]"
          style={{ background: DOME }}
        />
      </div>
      <div style={{ height: '4svh', background: NIGHT }} />
    </div>
  );
}
