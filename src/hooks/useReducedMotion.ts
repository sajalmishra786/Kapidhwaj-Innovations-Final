import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's prefers-reduced-motion setting reactively.
 * Components use this to disable JS-driven scroll/parallax effects.
 */
export function useReducedMotion(): boolean {
  // Read synchronously: initialising to `false` would let reduced-motion users
  // see the first frame of every entrance animation before the effect corrects it.
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
