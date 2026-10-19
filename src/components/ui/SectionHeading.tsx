import { motion } from 'framer-motion';
import { AnimatedText } from './AnimatedText';
import { fadeUp, inView } from '@/animations/motionVariants';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  /** `dark` for the night chapter; `light` (default) for cream surfaces. */
  tone?: 'light' | 'dark';
  className?: string;
}

/** Consistent eyebrow + animated title + supporting copy block. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  className,
}: SectionHeadingProps) {
  const isDark = tone === 'dark';

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <motion.span
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="eyebrow"
      >
        {eyebrow}
      </motion.span>
      <AnimatedText
        as="h2"
        text={title}
        className={cn('text-display max-w-3xl font-semibold', isDark ? 'text-cream-100' : 'text-ink-900')}
      />
      {description && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className={cn(
            'max-w-xl text-balance',
            isDark ? 'text-cream-100/60' : 'text-ink-900/55',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
