import { useEffect, useState } from 'react';

/**
 * True once a font matching `descriptor` (e.g. `'700 1em "Space Grotesk"'`) has
 * actually loaded. Stays false if the font never arrives — a blocked stylesheet
 * leaves no matching face at all, so `document.fonts.check()` would wrongly say
 * "loaded"; `load()` resolving with an empty list is the reliable signal.
 */
export function useFontLoaded(descriptor: string): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!('fonts' in document)) return;

    let cancelled = false;
    document.fonts
      .load(descriptor)
      .then((faces) => !cancelled && setLoaded(faces.length > 0))
      .catch(() => !cancelled && setLoaded(false));

    return () => {
      cancelled = true;
    };
  }, [descriptor]);

  return loaded;
}
