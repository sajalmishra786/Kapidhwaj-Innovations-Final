/**
 * How far the "Why Choose Us" wheel (CircleScroll) rides up under the end of the
 * NightRise dome.
 *
 * Without it the wheel's section only began once the dome's track had ended, and
 * the dome finishes covering the screen well before that (about 80% of its pinned
 * scroll on a laptop, 66% on a phone). That left a quarter to a third of a screen
 * of plain dark scrolling before the "Your Success, Our Mission." heading arrived.
 *
 * Overlapping the two lets the wheel start rising from the bottom while the dome
 * completes. The wheel's surface is the same NIGHT colour as the dome's body, so
 * its leading edge is invisible: it rises through the bottom of the screen, which
 * the dome turned dark long before, and never reaches the dome's rim at the top
 * corners. Keep this below the pinned rise distance (60svh) minus the point where
 * the rim clears the bottom; 30svh leaves a wide margin at every aspect ratio.
 */
export const NIGHT_HANDOFF_OVERLAP = '30svh';
