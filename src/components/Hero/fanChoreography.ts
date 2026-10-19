import type { Target, Transition } from 'framer-motion';
import type { CardPose } from './fanLayout';
import { HERO_TIMING } from './heroMotion';

/**
 * Where the fan is in its entrance:
 * - `flight`  — the stack is arriving; only the front card is visible.
 * - `fan`     — the stack is opening into the arch.
 * - `settled` — done; layout changes and hover use the settled spring.
 */
export type FanPhase = 'flight' | 'fan' | 'settled';

/** The front card is thrown in tilted counter-clockwise and pitched toward the viewer. */
const FLIGHT_TILT_DEG = -24;
const FLIGHT_PITCH_DEG = 16;
/** Seen from slightly closer while it is in the air. */
const FLIGHT_SCALE = 1.1;
/** Perspective for each card's own 3D turn (pitch in flight, yaw in the arch). */
export const CARD_PERSPECTIVE = 900;

/** Rises quickly then decelerates into place (≈ ease-out quad). */
const RISE_EASE = [0.25, 0.46, 0.45, 0.94] as const;
/** Holds its tilt through most of the climb, then straightens as it lands. */
const UNWIND_EASE = [0.6, 0.05, 0.3, 1] as const;

/** Starts gently as the cards slip out from under the front one, then glides to a soft stop. */
const FAN_EASE = [0.45, 0.05, 0.15, 1] as const;

const SETTLED_SPRING: Transition = { type: 'spring', stiffness: 120, damping: 20 };

/** Where every card begins: below the screen, tilted. Only the front card is visible. */
export function flightStart(flightY: number, isFront: boolean): Target {
  return {
    x: 0,
    y: flightY,
    rotate: FLIGHT_TILT_DEG,
    rotateX: FLIGHT_PITCH_DEG,
    rotateY: 0,
    scale: FLIGHT_SCALE,
    opacity: isFront ? 1 : 0,
  };
}

/**
 * Where a card is heading in each phase. During the flight the whole stack
 * travels as one — identical transforms, so the cards behind are hidden — and
 * in the fan each card takes its place on the arch.
 */
export function slotTarget(phase: FanPhase, pose: CardPose, nudgeX: number, isFront: boolean): Target {
  if (phase === 'flight') {
    return { x: 0, y: 0, rotate: 0, rotateX: 0, rotateY: 0, scale: 1, opacity: isFront ? 1 : 0 };
  }
  return {
    x: pose.x + nudgeX,
    y: pose.y,
    rotate: pose.rotate,
    rotateX: 0,
    rotateY: pose.yaw,
    scale: 1,
    opacity: 1,
  };
}

export function slotTransition(phase: FanPhase): Transition {
  if (phase === 'settled') {
    return { ...SETTLED_SPRING, opacity: { duration: 0.2 } };
  }

  if (phase === 'flight') {
    const timing = { duration: HERO_TIMING.flightDuration, delay: HERO_TIMING.flight };
    return {
      y: { ...timing, ease: RISE_EASE },
      scale: { ...timing, ease: RISE_EASE },
      rotate: { ...timing, ease: UNWIND_EASE },
      rotateX: { ...timing, ease: UNWIND_EASE },
      x: { duration: 0 },
      opacity: { duration: 0 },
    };
  }

  // Every card gets the *same* timing and easing, with no stagger — so the
  // stack opens left and right at the same instant, each pair a mirror image,
  // and every card arrives at the same moment. (Cards travelling farther simply
  // move faster; none starts early or late.)
  const timing = { duration: HERO_TIMING.fanDuration, ease: FAN_EASE };
  return {
    x: timing,
    y: timing,
    rotate: timing,
    rotateX: timing,
    rotateY: timing,
    scale: timing,
    opacity: { duration: 0.2 },
  };
}
