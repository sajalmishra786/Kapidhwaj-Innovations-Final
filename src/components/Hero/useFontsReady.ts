import { useEffect, useState } from 'react';

/** The faces the hero's first paint depends on. */
const HERO_FONTS = [
  '500 1em "Space Grotesk"',
  '600 1em "Space Grotesk"',
  '600 1em Inter',
  '400 1em "JetBrains Mono"',
];

/** Never hold the hero back longer than this, even on a bad connection. */
const MAX_WAIT_MS = 1200;

function areLoaded(): boolean {
  return !('fonts' in document) || HERO_FONTS.every((face) => document.fonts.check(face));
}

/**
 * True once the hero's web fonts are usable (or after a short grace period).
 * Starting the entrance on a fallback font would make the headline re-flow and
 * jump the moment the real one swaps in, mid-animation.
 */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(areLoaded);

  useEffect(() => {
    if (ready) return;

    let isCancelled = false;
    const finish = () => {
      if (!isCancelled) setReady(true);
    };

    const timer = window.setTimeout(finish, MAX_WAIT_MS);
    Promise.all(HERO_FONTS.map((face) => document.fonts.load(face))).then(finish, finish);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready]);

  return ready;
}
