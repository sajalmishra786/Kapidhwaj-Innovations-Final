import { motion } from 'framer-motion';
import type { ReactNode, MouseEvent } from 'react';
import { useMagnetic } from '@/hooks/useMagnetic';
import { springSnappy } from '@/animations/motionVariants';
import { cn } from '@/lib/cn';

interface MagneticButtonProps {
  children: ReactNode;
  /** Anchor target (e.g. "#contact"). Defaults to no navigation. */
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  variant?: 'primary' | 'ghost';
  className?: string;
  ariaLabel?: string;
}

/**
 * A CTA that drifts toward the cursor (magnetic) with a glow on hover.
 * Rendered as an anchor for native keyboard/focus behaviour. Uses
 * transform/opacity only; magnetism is disabled under reduced motion.
 */
export function MagneticButton({
  children,
  href = '#',
  onClick,
  variant = 'primary',
  className,
  ariaLabel,
}: MagneticButtonProps) {
  const { ref, x, y, onMouseMove, onMouseLeave } =
    useMagnetic<HTMLAnchorElement>(0.4);

  const base = cn(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium tracking-wide outline-none ring-accent-cyan/60 will-change-transform focus-visible:ring-2',
    variant === 'primary' ? 'text-white' : 'glass text-ink-900/90 hover:text-ink-900',
    className,
  );

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ x, y }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      className={base}
    >
      {variant === 'primary' && (
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-ember"
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-accent-cyan to-accent-violet opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.a>
  );
}
