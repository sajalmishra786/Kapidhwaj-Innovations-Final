import { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { TIMELINE, WHY_CHOOSE_US_SUBTITLE } from '@/data/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useWheelLayout } from './useWheelLayout';
import { useSequentialStep } from './useSequentialStep';
import { stepFromProgress, trackHeight } from './steps';
import { WHEEL_SPACING_DEG, type WheelLayout } from './wheelLayout';

const TOTAL = TIMELINE.length;
const RADIUS = 50;
/** Angle at the top of the arc, where the active step sits. */
const APEX_DEG = -90;
/** A node this close to the apex (degrees) is hidden under the active badge. */
const APEX_HIDE_DEG = 14;
const DEG = Math.PI / 180;
/**
 * Time between one step and the next when the scroll is ahead of the display. A step
 * leaves in 0.45s and the next arrives over 0.75s: this is long enough to see the
 * number on screen before the following one replaces it.
 */
const STEP_DWELL_MS = 800;

const BG = '#1A1714';
const ACCENT = '#E0795E';
const HEADING = '#F4F1EA';

/**
 * How strongly the arc is drawn along its width, as [offset, opacity] from its left
 * end; the right end mirrors it. The ends dissolve rather than stop, so the endless
 * wheel doesn't read as a line that has been cut.
 *
 * The full-width arc's ends sit at the screen edges, and a steep flank there is
 * better lost. A phone's is a bowl wider than the screen, so its ends are cropped
 * off-screen anyway; what shows is the top of the curve running out through both
 * edges, and a ramp would only fade that. It stays at one even strength.
 */
const ARC_RAMP = [[0, 0], [0.09, 0.04], [0.22, 0.15]] as const;
const BOWL_RAMP = [[0, 0.22]] as const;

function arcStops(ramp: readonly (readonly [number, number])[]) {
  const mirrored = [...ramp].reverse().map(([offset, opacity]) => [1 - offset, opacity] as const);
  return [...ramp, ...mirrored];
}

/**
 * Wrap an angle into the window of one full turn of the wheel, centred on the apex:
 * [-225°, 45°) for 6 steps 45° apart. Wrapping every node's angle into it makes the
 * wheel endless: as step 6 reaches the apex, step 1 re-enters on the right-hand side
 * of the arc on its own. That replaces the old hard-coded "ghost 1" badge, which was
 * pinned to a fixed coordinate and so never lined up with the node on the opposite side.
 */
function wrapAngle(a: number, period: number) {
  const half = period / 2;
  return (((a - APEX_DEG + half) % period) + period) % period - half + APEX_DEG;
}

/**
 * Visibility for an orbit node at `angle`. Nodes live on the upper half of the
 * arc (sin < 0); they feather out as they approach either horizon, and the one
 * within `apexHide` degrees of the apex is hidden because the coral active badge
 * stands in for it.
 */
function orbitOpacity(angle: number, apexHide: number) {
  if (Math.abs(angle - APEX_DEG) < apexHide) return 0;
  const s = Math.sin(angle * DEG);
  if (s >= -0.12) return 0;
  if (s >= -0.45) return (-0.12 - s) / 0.33;
  return 1;
}

/**
 * Why Choose Us — scroll-driven wheel with discrete step snapping.
 *
 * One screen of scroll per step (see `steps`). The scroll picks the step it is on,
 * with a margin at each edge; the display then walks to it one step at a time, so a
 * hard flick turns the wheel through every number instead of skipping them.
 * When at the last step, the first orbit node stays visible on the far side
 * of the arc so the semicircle looks visually complete.
 */
export function CircleScroll() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [scrolledStep, setScrolledStep] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const layout = useWheelLayout(stageRef, probeRef, headingRef, WHEEL_SPACING_DEG, !reduced);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setIsPinned(latest > 0 && latest < 1);
    setScrolledStep((current) => stepFromProgress(latest, current, TOTAL));
  });

  // Off the pinned screen nobody is watching the steps, so the display just follows the scroll.
  const activeStep = useSequentialStep(scrolledStep, isPinned, STEP_DWELL_MS);

  /*
    The wheel is now driven by a single spring on the *rotation angle* rather
    than by springing each node's left/top independently. Animating left/top
    separately interpolates along a straight chord, so mid-transition every node
    cut across the inside of the arc instead of riding it. Deriving x/y from one
    animated angle keeps every node exactly on the curve for the whole travel.
  */
  const wheelTarget = useMotionValue(0);
  const wheelAngle = useSpring(wheelTarget, { stiffness: 45, damping: 16, mass: 1 });

  useEffect(() => {
    wheelTarget.set(-activeStep * layout.spacingDeg);
  }, [activeStep, layout.spacingDeg, wheelTarget]);

  if (reduced) return <StaticLoop />;

  return (
    <div ref={ref} className="relative" style={{ background: BG, height: `${trackHeight(TOTAL)}svh` }}>
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: BG }}>
        <GrainOverlay />

        {/* warm glow pooled under the apex */}
        <div
          className="pointer-events-none absolute left-1/2 top-[34vh] h-[52vh] w-[52vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${ACCENT}24, transparent 68%)` }}
        />

        {/* editorial heading — centred on a phone, top-left from `sm` (always visible) */}
        <div className="pointer-events-none absolute inset-x-0 top-[6vh] z-10 select-none px-[5vw] text-center sm:inset-x-auto sm:left-[5vw] sm:px-0 sm:text-left">
          {/* the smallest phones (about 568px tall) have no height to spare for it; it stays
              for screen readers */}
          <span
            className="font-mono text-xs font-semibold uppercase tracking-[0.35em] max-sm:[@media(max-height:600px)]:sr-only"
            style={{ color: ACCENT }}
          >
            Why Choose Us?
          </span>
          <h2
            ref={headingRef}
            // From `sm` the size follows the width (7.03vw − 8.75px) so the heading always
            // stops short of the centred apex badge — at a fixed 60px / 72px it ran into
            // the badge on every tablet-sized screen — and is capped by the height
            // (9.2svh) so a short screen leaves room under it. Both reach the old 72px
            // on any screen big enough to have fitted it. On a phone it follows the
            // width too, large enough to lead the section but never wider than two lines.
            className="mt-3 max-sm:[@media(max-height:600px)]:mt-0 font-display text-[clamp(2.1rem,10.8vw,2.75rem)] font-medium leading-[1.04] tracking-tight sm:text-[clamp(2.25rem,min(calc(7.03vw_-_8.75px),9.2svh),4.5rem)]"
            style={{ color: HEADING }}
          >
            Your Success,
            <br />
            Our Mission.
          </h2>
          <p className="mt-3.5 hidden max-w-xs text-[0.82rem] leading-relaxed text-white/55 lg:block xl:max-w-sm xl:text-[0.88rem]">
            {WHY_CHOOSE_US_SUBTITLE}
          </p>
        </div>

        {/* Arc + orbiting nodes. The box is the arc's full ellipse — `2 × radiusX`
            wide, `2 × radiusY` tall, its top edge on the apex. On any screen the copy
            fits inside, that is the stage's full width and a true semicircle. A phone
            has no room for one, so its box is a circle wider than the stage: the stage
            crops it, and the copy sits below where it leaves the screen; see
            wheelLayout. The nodes ride it the same way, only turning less per step so
            the two beside the apex stay on screen. `preserveAspectRatio "none"` lets the
            arc stretch to match the node positions. */}
        <div
          data-wheel="arc"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: layout.apexY, width: layout.radiusX * 2, height: layout.radiusY * 2 }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {/*
              The arc is stroked with a gradient rather than a flat colour so its
              two ends dissolve instead of stopping dead. The wheel is endless —
              nodes ride off one side and re-enter on the other — and a
              hard-terminated stroke contradicted that, reading as a line that had
              simply been cut. `userSpaceOnUse` pins the ramp to the viewBox's own
              x axis, so the fade tracks the arc's ends however
              `preserveAspectRatio="none"` stretches the shape.

              It is the track the badges run on: without it they float unattached
              at the sides of the frame and the wheel stops reading as a wheel.
            */}
            <defs>
              <linearGradient id="loop-arc" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
                {arcStops(layout.compact ? BOWL_RAMP : ARC_RAMP).map(([offset, opacity]) => (
                  <stop key={offset} offset={offset} stopColor="#fff" stopOpacity={opacity} />
                ))}
              </linearGradient>
            </defs>
            <path
              d="M 0 50 A 50 50 0 0 1 100 50"
              fill="none"
              stroke="url(#loop-arc)"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {TIMELINE.map((_, i) => (
            <OrbitBadge key={`orbit-${i}`} index={i} spacingDeg={layout.spacingDeg} wheelAngle={wheelAngle} />
          ))}
        </div>

        {/* Hidden copy of every step, laid out like the visible copy, so the arc can be
            fitted to the widest and tallest of them (see useWheelLayout). */}
        <div
          ref={probeRef}
          aria-hidden
          className="pointer-events-none invisible absolute left-1/2 top-0 w-[min(92vw,40rem)] -translate-x-1/2 text-center"
        >
          {TIMELINE.map((node) => (
            <div key={node.label}>
              <StepCopy node={node} />
            </div>
          ))}
        </div>

        {/* active step: coral node + connector + sparkle + copy */}
        <AnimatePresence mode="wait">
          <ActiveStep key={activeStep} node={TIMELINE[activeStep]} index={activeStep} layout={layout} />
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Orbiting outline node ─────────────────────────────────────────────── */
/**
 * Every visual property is derived from one animated angle, so the badge is
 * mathematically pinned to the arc at every frame of the transition — it slides
 * *along* the semicircle rather than cutting the chord between two rest points.
 */
function OrbitBadge({
  index,
  spacingDeg,
  wheelAngle,
}: {
  index: number;
  spacingDeg: number;
  wheelAngle: MotionValue<number>;
}) {
  const base = APEX_DEG + index * spacingDeg;
  const period = TOTAL * spacingDeg;
  // never so wide that a neighbouring node, one spacing from the apex, is hidden with it
  const apexHide = Math.min(APEX_HIDE_DEG, spacingDeg / 2);

  const angle = useTransform(wheelAngle, (w) => wrapAngle(base + w, period));
  const left = useTransform(angle, (a) => `${50 + RADIUS * Math.cos(a * DEG)}%`);
  const top = useTransform(angle, (a) => `${50 + RADIUS * Math.sin(a * DEG)}%`);
  const rotate = useTransform(angle, (a) => a - APEX_DEG);
  const opacity = useTransform(angle, (a) => orbitOpacity(a, apexHide));
  // Nodes recede very slightly as they travel away from the apex — enough to
  // give the wheel depth without reading as a size change.
  const scale = useTransform(angle, (a) => 0.88 + 0.12 * Math.max(0, -Math.sin(a * DEG)));

  return (
    <motion.div
      data-wheel="node"
      style={{ left, top, opacity, x: '-50%', y: '-50%' }}
      className="absolute will-change-transform"
    >
      <motion.div
        style={{ rotate, scale }}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 font-display text-2xl text-white/55 backdrop-blur-[1px] sm:h-16 sm:w-16"
      >
        {index + 1}
      </motion.div>
    </motion.div>
  );
}

/* ── Active step (discrete snap with AnimatePresence) ──────────────────── */
interface ActiveStepProps {
  node: { label: string; detail: string };
  index: number;
  layout: WheelLayout;
}

const stepVariants = {
  enter: { opacity: 0, y: 40, scale: 0.92, filter: 'blur(8px)' },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.25, 1, 0.3, 1] }, // luxurious, long-tail easing
  },
  exit: {
    opacity: 0,
    y: -40,
    scale: 0.92,
    filter: 'blur(8px)',
    transition: { duration: 0.45, ease: [0.25, 1, 0.3, 1] },
  },
};

/** The step's title and description. Rendered for real, and again (hidden) to measure. */
function StepCopy({ node }: { node: { label: string; detail: string } }) {
  return (
    <>
      <h3
        className="font-display text-[2rem] font-medium tracking-tight max-sm:leading-[1.15] max-sm:short:text-[1.6rem] sm:text-5xl lg:text-[clamp(2.25rem,8svh,3.75rem)]"
        style={{ color: HEADING }}
      >
        {node.label}
      </h3>
      <p className="mx-auto mt-3 max-w-2xl text-balance text-[0.95rem] text-white/60 max-sm:short:mt-2 max-sm:short:text-[0.85rem] sm:mt-4 sm:text-lg">
        {node.detail}
      </p>
    </>
  );
}

function ActiveStep({ node, index, layout }: ActiveStepProps) {
  return (
    <motion.div
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="pointer-events-none absolute inset-0"
    >
      {/* connector line — from just under the badge down to the sparkle */}
      <div
        className={`absolute left-1/2 ${layout.compact ? 'w-[2px]' : 'w-[1px]'}`}
        style={{
          top: layout.connectorTop,
          height: layout.sparkleY - layout.connectorTop,
          background: ACCENT,
          transform: 'translateX(-50%)',
        }}
      />

      {/* floating coral apex node */}
      <div
        data-wheel="badge"
        className="absolute left-1/2"
        style={{ top: layout.badgeY, transform: 'translate(-50%, -50%)' }}
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full font-display text-2xl font-semibold shadow-xl"
          style={{ background: ACCENT, color: BG }}
        >
          {index + 1}
        </span>
      </div>

      {/* convergence sparkle — on the arc's apex, or on a phone, hanging below it. The
          tile hides the arc running behind it; on a phone the arc is already above. */}
      <div
        data-wheel="sparkle"
        className={`absolute left-1/2 flex items-center justify-center ${
          layout.compact ? 'h-11 w-11' : 'h-[46px] w-[46px] border border-white/5 bg-[#2A2624]'
        }`}
        style={{ top: layout.sparkleY, transform: 'translate(-50%, -50%)' }}
      >
        <Sparkle size={layout.compact ? 44 : 24} />
      </div>

      {/* title + description — placed inside the bowl, clear of the arc and nodes */}
      <div
        data-wheel="copy"
        className="absolute left-1/2 w-[min(92vw,40rem)] text-center"
        style={{ top: layout.copyTop, transform: 'translateX(-50%)' }}
      >
        <StepCopy node={node} />
      </div>
    </motion.div>
  );
}

/* ── Four-point sparkle ──────────────────────────────────────────────────── */
function Sparkle({ size }: { size: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      animate={{ rotate: [0, 90, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M12 1.5C12 6 18 12 22.5 12C18 12 12 18 12 22.5C12 18 6 12 1.5 12C6 12 12 6 12 1.5Z"
        fill={ACCENT}
      />
    </motion.svg>
  );
}

/* ── Film-grain overlay ──────────────────────────────────────────────────── */
function GrainOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-soft-light"
      aria-hidden
    >
      <filter id="loop-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#loop-grain)" />
    </svg>
  );
}

/* ── Reduced-motion fallback ─────────────────────────────────────────────── */
function StaticLoop() {
  return (
    <div className="px-6 py-24 sm:py-32" style={{ background: BG }}>
      <span
        className="font-mono text-xs font-semibold uppercase tracking-[0.35em]"
        style={{ color: ACCENT }}
      >
        Why Choose Us?
      </span>
      <h2
        className="mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl"
        style={{ color: HEADING }}
      >
        Your Success, Our Mission.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
        {WHY_CHOOSE_US_SUBTITLE}
      </p>
      <ol className="mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
        {TIMELINE.map((node, i) => (
          <li key={node.label}>
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-semibold"
              style={{ background: ACCENT, color: BG }}
            >
              {i + 1}
            </span>
            <h3 className="mt-4 font-display text-2xl font-medium" style={{ color: HEADING }}>
              {node.label}
            </h3>
            <p className="mt-2 text-sm text-white/55">{node.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
