/**
 * Geometry for the "Why choose us" wheel.
 *
 * The wheel is the upper half of an ellipse whose width is the stage width. The
 * apex badge, connector, sparkle and the arc all hang off one apex point, and the
 * step copy sits inside the bowl beneath it.
 *
 * Positions used to be fixed fractions of the viewport height (apex at 40vh, copy
 * at 47vh). The arc's size comes from the viewport *width*, so the two drifted
 * apart: on a tablet the arc was a deep circle, the copy sat shallow inside it,
 * and the arc and the orbit nodes ran straight through the title. This solves for
 * the copy's position from the real geometry instead, and only deviates from the
 * old placement when the old placement would have collided.
 *
 * A phone is laid out differently (see `solveCompactLayout`): it has no room for a
 * semicircle, so the arc becomes a wider-than-screen bowl that the edges crop, the
 * connector runs on through it to the sparkle, and the copy sits under the sparkle.
 *
 * Pure functions — no DOM — so the maths can be tested on its own.
 */

const DEG = Math.PI / 180;

/** Orbit badge radius (h-16 w-16). */
export const NODE_RADIUS = 32;
/** A phone's orbit badge is smaller (h-14 w-14). */
const PHONE_NODE_RADIUS = 28;
const NODE_GAP = 12;
/** Angle between neighbouring nodes on a wide screen — the two beside the apex are the ones in view. */
export const WHEEL_SPACING_DEG = 45;
/** However flat a phone's arc, its nodes sit no closer than this, so they still read as separate numbers. */
const MIN_PHONE_SPACING_DEG = 10;
/** How far inside the arc the copy must stay, so a node riding the arc clears it. */
const ARC_CLEARANCE = NODE_RADIUS + NODE_GAP;
/** Room kept clear at the bottom for the fixed navigation dock: its 74px, plus a 16px gap. */
const DOCK_CLEARANCE = 90;
/**
 * Gap kept between the arc's tips and the copy beneath, when a line is too wide for the
 * bowl and has to start below its diameter. Without it the arc ends flush on the title.
 */
const TIP_CLEARANCE = 16;
/** Gap kept between the arc and the heading's corner. */
const HEADING_CLEARANCE = 14;
/** The connector between the apex badge and the sparkle never gets shorter than this. */
const MIN_CONNECTOR = 28;
/** Below this width the layout uses the compact (phone) anchors. */
const COMPACT_BELOW = 640;
/** The sparkle on a phone is drawn bare at 44px (see CircleScroll). */
const SPARKLE_RADIUS = 22;
/**
 * Where a phone's heading is assumed to end, as a share of the height, until it has
 * been measured. It is centred under the eyebrow, two lines of it.
 */
const COMPACT_HEADING_BOTTOM = 0.2;
/** Room between the heading and the badge, the badge and the arc's apex, the sparkle and the copy. */
const COMPACT_GAPS = { heading: 28, apex: 40, copy: 26 } as const;

/** The heading's reach: the arc must pass below its bottom-right corner. */
export interface HeadingBox {
  /** Right edge, px from the stage's left. */
  right: number;
  /** Bottom edge, px from the stage's top. */
  bottom: number;
}

/** One rendered line of copy, measured relative to the top of its block. */
export interface CopyLine {
  /** Top of the line, px below the top of the copy block. */
  y: number;
  /** Half the line's width, px — the copy is centred, so this is its reach either side of the axis. */
  halfWidth: number;
}

export interface WheelInput {
  /** Stage size, px. */
  width: number;
  height: number;
  /** Every line of every step's copy: the arc is static, so it must clear the worst case. */
  lines: CopyLine[];
  /** Height of the tallest step's copy block, px. */
  copyHeight: number;
  /** Angle between neighbouring nodes — the two beside the apex are the ones in view. */
  neighbourDeg: number;
  /**
   * The heading, top-left. Raising the apex to make room for the copy must not run the arc
   * through it. On a phone it is centred and only its bottom is used: the stack starts below it.
   */
  heading?: HeadingBox;
}

export interface WheelLayout {
  /** A phone: the layout uses compact anchors, and the arc is a bowl wider than the screen (see CircleScroll). */
  compact: boolean;
  /** Top of the arc, px from the stage top. */
  apexY: number;
  /**
   * Sparkle centre, px from the stage top — where the connector ends. On a wide screen
   * the sparkle sits on the apex; on a phone it hangs below it, level with where the
   * screen edges crop the arc, so the connector runs through the arc to reach it.
   */
  sparkleY: number;
  /**
   * Angle between neighbouring orbit nodes, degrees: how far the wheel turns per step.
   * Fixed on a wide screen. A phone's bowl is wider than the screen, so there it is
   * the angle at which the two nodes beside the apex still sit fully on screen.
   */
  spacingDeg: number;
  /** Horizontal radius of the arc's ellipse, px. Half the width, except on a phone, where the bowl is wider than the screen. */
  radiusX: number;
  /** Vertical radius of the arc's ellipse, px. */
  radiusY: number;
  /** Top of the copy block, px. */
  copyTop: number;
  /** Centre of the coral apex badge, px. */
  badgeY: number;
  /** Top of the connector line, px. It always runs down to the sparkle. */
  connectorTop: number;
}

/**
 * The placement the section always had — a true semicircle with the copy at a
 * fixed fraction of the height; on a phone, the roomy compact stack instead. It is
 * the starting point, and the fallback when nothing has been measured yet.
 */
export function defaultLayout(width: number, height: number): WheelLayout {
  if (width < COMPACT_BELOW) return compactLayoutAt(width, height * COMPACT_HEADING_BOTTOM, BASE);
  return {
    compact: false,
    apexY: height * 0.4,
    sparkleY: height * 0.4,
    spacingDeg: WHEEL_SPACING_DEG,
    radiusX: width / 2,
    radiusY: width / 2,
    copyTop: height * 0.47,
    badgeY: height * 0.16,
    connectorTop: height * 0.2,
  };
}

/** How a phone's stack is spread out: the arc's width, and how much of each gap is kept. */
interface Rung {
  /** The arc's radius as a multiple of half the screen's width. Above 1 the edges crop it. */
  spread: number;
  /** Multiple of each `COMPACT_GAPS` entry. */
  scale: number;
}

/** A round bowl, with every gap at its stated size. */
const BASE: Rung = { spread: 1.25, scale: 1 };

/**
 * From the airiest to the tightest, the first that fits is used. A tall phone gets
 * the gaps opened up; a short one gets them trimmed. Past that, a bowl that is wider
 * and flatter has less distance between its apex and the height where the screen
 * crops it, and that is how far the sparkle hangs below the apex, so flattening it
 * wins back more height without breaking the shape.
 */
const COMPACT_LADDER: readonly Rung[] = [
  { spread: 1.25, scale: 1.5 },
  { spread: 1.25, scale: 1.25 },
  BASE,
  { spread: 1.25, scale: 0.75 },
  { spread: 1.4, scale: 0.6 },
  { spread: 1.7, scale: 0.5 },
  { spread: 2.2, scale: 0.4 },
  { spread: 3, scale: 0.3 },
];

/**
 * A phone's stack, top to bottom: the heading, the coral badge, the arc's apex, the
 * sparkle, then the copy. The arc is a circle of radius `spread × half-width`; at the
 * screen's edge it has dropped `edgeDrop` below its apex, and the sparkle sits there.
 */
function compactLayoutAt(width: number, headingBottom: number, { spread, scale }: Rung): WheelLayout {
  const half = width / 2;
  const radius = half * spread;
  const edgeDrop = half * (spread - Math.sqrt(spread * spread - 1));

  // the apex badge is the same size as an orbit node
  const badgeY = headingBottom + COMPACT_GAPS.heading * scale + NODE_RADIUS;
  const connectorTop = badgeY + NODE_RADIUS;
  const apexY = connectorTop + COMPACT_GAPS.apex * scale;
  const sparkleY = apexY + edgeDrop;
  const copyTop = sparkleY + SPARKLE_RADIUS + COMPACT_GAPS.copy * scale;

  // the nodes beside the apex ride the bowl out toward the screen's edges: keep them whole
  const nodeReach = half - PHONE_NODE_RADIUS - NODE_GAP;
  const spacingDeg = Math.max(
    MIN_PHONE_SPACING_DEG,
    Math.min(WHEEL_SPACING_DEG, Math.asin(Math.min(1, nodeReach / radius)) / DEG),
  );

  return { compact: true, apexY, sparkleY, spacingDeg, radiusX: radius, radiusY: radius, copyTop, badgeY, connectorTop };
}

/**
 * The airiest phone layout whose copy still clears the dock; failing that, the
 * tightest one there is.
 */
function solveCompactLayout({ width, height, copyHeight, heading }: WheelInput): WheelLayout {
  const headingBottom = heading?.bottom ?? height * COMPACT_HEADING_BOTTOM;
  const budget = height - DOCK_CLEARANCE;
  const layouts = COMPACT_LADDER.map((rung) => compactLayoutAt(width, headingBottom, rung));
  return layouts.find((layout) => layout.copyTop + copyHeight <= budget) ?? layouts[layouts.length - 1];
}

/**
 * Depth below the apex at which the arc is `reach` px from the vertical axis.
 * A line wider than the bowl can only sit below the diameter, and clear of its tips.
 */
function arcDepthAt(reach: number, rx: number, ry: number): number {
  if (reach >= rx) return ry + TIP_CLEARANCE;
  return ry * (1 - Math.sqrt(1 - (reach / rx) ** 2));
}

/** Smallest gap between the apex and the copy block that keeps it clear of the arc and the nodes. */
function depthToClear(rx: number, ry: number, lines: CopyLine[], neighbourDeg: number): number {
  let depth = 0;

  // every line must sit inside the arc, with room for a node riding on it
  for (const line of lines) {
    const arcDepth = arcDepthAt(line.halfWidth + ARC_CLEARANCE, rx, ry);
    depth = Math.max(depth, arcDepth - line.y);
  }

  // the two nodes beside the apex rest on the arc; any line that reaches under one
  // must start below it
  const nodeX = rx * Math.sin(neighbourDeg * DEG);
  const nodeY = ry * (1 - Math.cos(neighbourDeg * DEG));
  for (const line of lines) {
    if (nodeX - NODE_RADIUS < line.halfWidth + NODE_GAP) {
      depth = Math.max(depth, nodeY + NODE_RADIUS + NODE_GAP - line.y);
    }
  }

  return depth;
}

/**
 * Lowest apex that keeps the arc below the heading's bottom-right corner. Moving
 * left from the apex the arc only drops, so that corner is the closest it gets.
 * `centre` is the arc's axis, px from the stage's left.
 */
function apexToClearHeading(heading: HeadingBox, centre: number, rx: number, ry: number): number {
  const reach = Math.min(Math.abs(heading.right - centre), rx);
  const drop = ry * (1 - Math.sqrt(1 - (reach / rx) ** 2));
  return heading.bottom + HEADING_CLEARANCE - drop;
}

interface Ellipse {
  rx: number;
  ry: number;
}

/** Arc shapes to try, the true semicircle first, then flatter ones, in the order they are preferred. */
function* shapeCandidates(rx: number): Generator<Ellipse> {
  for (let step = 0; step <= 12; step++) yield { rx, ry: rx * (1 - step * 0.05) };
}

/** Apex heights to try, the original first, then nudged up — ending on the highest it may go. */
function* apexCandidates(from: number, floor: number): Generator<number> {
  let y = from;
  for (; y >= floor; y -= 8) yield y;
  if (y + 8 > floor) yield floor;
}

/**
 * Pick the roundest arc, at the original height, whose copy clears the arc and the
 * nodes and still fits above the dock: flatten the arc, then raise it, only as far as
 * that takes. A phone has its own layout, `solveCompactLayout`.
 */
export function solveWheelLayout(input: WheelInput): WheelLayout {
  if (input.width < COMPACT_BELOW) return solveCompactLayout(input);

  const { width, height, lines, copyHeight, neighbourDeg, heading } = input;
  const base = defaultLayout(width, height);
  const centre = width / 2;
  const budget = height - DOCK_CLEARANCE;
  const originalDepth = base.copyTop - base.apexY;
  const apexFloor = base.connectorTop + MIN_CONNECTOR;

  let tightest: WheelLayout | null = null;

  for (const { rx, ry } of shapeCandidates(centre)) {
    const depth = Math.max(originalDepth, depthToClear(rx, ry, lines, neighbourDeg));
    // the apex can rise to fit the copy, but never so far that the arc meets the heading
    const floor = Math.max(apexFloor, heading ? apexToClearHeading(heading, centre, rx, ry) : 0);

    for (const apexY of apexCandidates(Math.max(base.apexY, floor), floor)) {
      const candidate: WheelLayout = { ...base, apexY, sparkleY: apexY, radiusX: rx, radiusY: ry, copyTop: apexY + depth };
      if (candidate.copyTop + copyHeight <= budget) return candidate;
      if (!tightest || candidate.copyTop < tightest.copyTop) tightest = candidate;
    }
  }

  // Nothing fits (a very short screen): the least-bad option is the flattest, highest one.
  return tightest ?? base;
}
