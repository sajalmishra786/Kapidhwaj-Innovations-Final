import { useScroll, useSpring, type MotionValue } from 'framer-motion';

/**
 * Returns a smoothed 0→1 progress value for the whole document,
 * suitable for a top scroll-progress bar.
 */
export function useScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  return useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
}
