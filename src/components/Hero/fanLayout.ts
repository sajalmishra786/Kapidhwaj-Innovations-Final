import { useLayoutEffect, useState, type RefObject } from 'react';

/** Geometry of the card fan for the room it has been given, in CSS pixels. */
export interface FanLayout {
  /** Cards shown — the compact layout drops the outermost ones. */
  count: number;
  cardW: number;
  cardH: number;
  /** Horizontal distance between neighbouring card centres. */
  pitch: number;
  /** Width of the whole fan, edge to edge, before rotation. */
  fanW: number;
  /** Height the stage actually uses: card, the arc's drop, and headroom above. */
  stageH: number;
  /** Height it would take if nothing squeezed it — the most it should ever claim. */
  naturalStageH: number;
  isCompact: boolean;
}

/** Where one card rests, relative to the stage centre. */
export interface CardPose {
  x: number;
  y: number;
  rotate: number;
  /** Turn about the vertical axis, so outer cards angle in toward the middle. */
  yaw: number;
}

/** A fan measured against the screen it will fly in on. */
export interface MeasuredFan {
  layout: FanLayout;
  /** How far below its resting place the front card starts — just past the viewport's bottom edge. */
  flightY: number;
}

const MAX_CARD_W = 240;
const MIN_CARD_W = 96;
const CARD_ASPECT = 1.1; // height ÷ width
const COMPACT_BREAKPOINT = 600;
/** How far the outermost cards sit below the middle one, as a share of card height. */
const ARC_DROP = 0.12;
const ARC_ROTATE_DEG = 9;
const ARC_ROTATE_DEG_COMPACT = 7;
const ARC_YAW_DEG = 14;
const ARC_YAW_DEG_COMPACT = 9;
/** The flight never starts closer than this, so short screens still get a real entrance. */
const MIN_FLIGHT_Y = 320;
/** Share of each card left uncovered by its right-hand neighbour. */
const VISIBLE_SHARE = 0.62;
const VISIBLE_SHARE_COMPACT = 0.5;
/** The outer cards lean out past the fan's edge; leave room for that, in card widths. */
const LEAN_OVERHANG = 0.2;
/** Headroom above the cards for the speech bubbles and the hover lift. */
export const BUBBLE_ROOM = 44;
/** Absorbs rounding so a stage sized from a card measures back to that same card. */
const HEIGHT_TOLERANCE = 2;
const SNAP = 4;

const snap = (value: number) => Math.floor(value / SNAP) * SNAP;
const stageHeight = (cardH: number) => cardH + Math.round(cardH * ARC_DROP) + BUBBLE_ROOM;

/**
 * Sizes the fan to a box. Width decides how big the cards *could* be; the box's
 * height can only shrink them — so on a short laptop screen the fan gives way to
 * the headline and buttons instead of pushing them off the page.
 */
export function computeFanLayout(boxW: number, boxH: number): FanLayout {
  const isCompact = boxW < COMPACT_BREAKPOINT;
  const count = isCompact ? 5 : 7;
  const visibleShare = isCompact ? VISIBLE_SHARE_COMPACT : VISIBLE_SHARE;

  const fitW = boxW / (1 + (count - 1) * visibleShare + LEAN_OVERHANG);
  const widthLimitedW = Math.max(MIN_CARD_W, snap(Math.min(MAX_CARD_W, fitW)));
  const heightLimitedW = (boxH - BUBBLE_ROOM + HEIGHT_TOLERANCE) / (1 + ARC_DROP) / CARD_ASPECT;

  const cardW = Math.max(MIN_CARD_W, Math.min(widthLimitedW, snap(heightLimitedW)));
  const cardH = Math.round(cardW * CARD_ASPECT);
  const pitch = cardW * visibleShare;

  return {
    count,
    cardW,
    cardH,
    pitch,
    fanW: cardW + (count - 1) * pitch,
    stageH: stageHeight(cardH),
    naturalStageH: stageHeight(Math.round(widthLimitedW * CARD_ASPECT)),
    isCompact,
  };
}

/** Arch: centre card highest and upright, outer cards lower and leaning outward. */
export function cardPose(index: number, layout: FanLayout): CardPose {
  const mid = (layout.count - 1) / 2;
  const t = (index - mid) / mid; // -1 (far left) … 1 (far right)
  const lean = layout.isCompact ? ARC_ROTATE_DEG_COMPACT : ARC_ROTATE_DEG;
  const yaw = layout.isCompact ? ARC_YAW_DEG_COMPACT : ARC_YAW_DEG;

  return {
    x: (index - mid) * layout.pitch,
    y: t * t * layout.cardH * ARC_DROP,
    rotate: t * lean,
    yaw: -t * yaw,
  };
}

function isSameLayout(a: FanLayout, b: FanLayout): boolean {
  return (
    a.count === b.count &&
    a.cardW === b.cardW &&
    a.naturalStageH === b.naturalStageH &&
    a.isCompact === b.isCompact
  );
}

/**
 * Fan geometry for the element it will live in. Null until that element has been
 * measured (before first paint), and recomputed at most once per frame after.
 */
export function useFanLayout(boxRef: RefObject<HTMLElement | null>): MeasuredFan | null {
  const [measured, setMeasured] = useState<MeasuredFan | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    let frame = 0;
    const measure = () => {
      const { width, height, top } = box.getBoundingClientRect();
      const next = computeFanLayout(width, height);
      const flightY = Math.max(MIN_FLIGHT_Y, window.innerHeight - top);
      setMeasured((prev) => (prev && isSameLayout(prev.layout, next) ? prev : { layout: next, flightY }));
    };

    measure();
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(box);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [boxRef]);

  return measured;
}
