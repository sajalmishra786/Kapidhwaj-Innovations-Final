/**
 * Entrance choreography for the hero, in seconds. One clock for every piece so
 * the sequence reads as a single beat:
 *
 * 1. the headline types in word by word while the front card **flies in from
 *    below the screen**, tilted, and straightens as it lands on top of the stack;
 * 2. the cards beneath **slip out from under it** into the fan — left and right
 *    together, mirror images of each other;
 * 3. the description and buttons blur into focus, then the bubbles pop.
 */
export const HERO_TIMING = {
  brand: 0.45,
  headline: 0.2,
  /** Gap between consecutive headline words. */
  wordStagger: 0.075,
  /** When the front card starts its flight, and how long it takes to land. */
  flight: 0.2,
  flightDuration: 1.6,
  /** The stack starts to open this long before the flight has fully landed. */
  fanOverlap: 0.15,
  /** How long the stack takes to open into the fan — all cards together, left and right at once. */
  fanDuration: 1.3,
  description: 2.35,
  actions: 2.55,
  bubbles: 3.05,
} as const;

/** When the stack begins to open into the fan, in seconds from mount. */
export const FAN_START = HERO_TIMING.flight + HERO_TIMING.flightDuration - HERO_TIMING.fanOverlap;

/** After this the entrance is over and layout changes should move without delays. */
export const ENTRANCE_MS = 3800;

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Hover/focus lift: quick to respond, settles without bounce. */
export const LIFT_SPRING = { type: 'spring', stiffness: 240, damping: 26, mass: 0.8 } as const;
