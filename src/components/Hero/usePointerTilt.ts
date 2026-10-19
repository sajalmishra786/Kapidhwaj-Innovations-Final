import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

const MAX_TILT_DEG = 5;
const SPRING = { stiffness: 60, damping: 18 };

interface PointerTilt {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

/**
 * Eases a small 3D tilt toward wherever the mouse is on screen. Pointer-driven,
 * never scroll-driven. Inert for touch and whenever `enabled` is false.
 */
export function usePointerTilt(enabled: boolean): PointerTilt {
  const px = useSpring(useMotionValue(0), SPRING);
  const py = useSpring(useMotionValue(0), SPRING);

  useEffect(() => {
    if (!enabled || !window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (event: PointerEvent) => {
      px.set(event.clientX / window.innerWidth - 0.5);
      py.set(event.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      px.set(0);
      py.set(0);
    };
  }, [enabled, px, py]);

  return {
    rotateY: useTransform(px, [-0.5, 0.5], [-MAX_TILT_DEG, MAX_TILT_DEG]),
    rotateX: useTransform(py, [-0.5, 0.5], [MAX_TILT_DEG * 0.7, -MAX_TILT_DEG * 0.7]),
  };
}
