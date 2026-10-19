import { useRef, useCallback } from 'react';
import {
  useMotionValue,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

interface MagneticResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  onMouseMove: (event: React.MouseEvent<T>) => void;
  onMouseLeave: () => void;
}

/**
 * Magnetic attraction — element drifts toward the cursor within its bounds,
 * springs back on leave. No-op under reduced motion.
 *
 * @param strength fraction of the offset to apply (0–1).
 */
export function useMagnetic<T extends HTMLElement = HTMLDivElement>(
  strength = 0.35,
): MagneticResult<T> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.5 });

  const onMouseMove = useCallback(
    (event: React.MouseEvent<T>) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      x.set(offsetX * strength);
      y.set(offsetY * strength);
    },
    [reduced, strength, x, y],
  );

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { ref, x, y, onMouseMove, onMouseLeave };
}
