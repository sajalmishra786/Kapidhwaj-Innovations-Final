import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Accessible label for the landmark region. */
  label?: string;
  /** When false, removes default vertical padding (for sticky/scroll sections). */
  padded?: boolean;
}

/**
 * Semantic <section> landmark with a stable id for scroll tracking and
 * consistent horizontal gutters. Forwarded ref for scroll measurement.
 */
export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  ({ id, children, className, label, padded = true }, ref) => (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      className={cn(
        'relative w-full',
        padded && 'py-section',
        className,
      )}
    >
      {children}
    </section>
  ),
);

SectionWrapper.displayName = 'SectionWrapper';
