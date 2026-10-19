/**
 * A pennant on a pole, planted on top of a letter of the wordmark — "dhwaj" is
 * Sanskrit for flag, so the brand name gets its own banner. Sized in em so it
 * scales with the wordmark; the banner ripples via the `flag-wave` keyframes.
 *
 * Placement is measured, not eyeballed, for Space Grotesk 700 on a 1em line box:
 * the "d" stem is centred 0.505em from the glyph origin and its ascender top sits
 * 0.146em below the line top. The pole's foot dips 0.01em into that stem, so the
 * svg's top edge is 0.146 + 0.01 - 0.34 = -0.184em and its left edge is
 * 0.505em minus the pole's own offset (0.015em).
 */
export function FooterFlag() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 56 96"
      className="pointer-events-none absolute left-[0.49em] top-[-0.184em] h-[0.34em] w-auto overflow-visible"
    >
      <rect x="2" y="2" width="4.5" height="94" rx="2.25" className="fill-ink-950" />
      <circle cx="4.25" cy="4" r="5" className="fill-ink-950" />
      <path
        d="M6.5 8 H52 L41 22 L52 36 H6.5 Z"
        className="origin-left animate-flag-wave fill-accent-coral [transform-box:fill-box]"
      />
    </svg>
  );
}
