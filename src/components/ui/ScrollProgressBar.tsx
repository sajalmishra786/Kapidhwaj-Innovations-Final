import { motion } from 'framer-motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';

/** Thin gradient progress bar fixed to the top of the viewport. */
export function ScrollProgressBar() {
  const progress = useScrollProgress();
  return (
    <motion.div
      style={{ scaleX: progress }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-ember"
      aria-hidden
    />
  );
}
