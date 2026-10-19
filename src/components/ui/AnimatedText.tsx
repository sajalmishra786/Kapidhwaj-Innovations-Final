import { cn } from '@/lib/cn';
import { ScrollRevealText } from './ScrollRevealText';

interface AnimatedTextProps {
  text: string;
  className?: string;
  /** @deprecated retained for API compatibility; the reveal is now scroll-driven. */
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/**
 * Section-heading reveal. Thin wrapper over {@link ScrollRevealText}: the words
 * illuminate from a faint ghost to full ink as the heading scrolls up the
 * viewport (spring-smoothed, left-to-right). Kept as `inline-block` so existing
 * centered / max-width headings lay out exactly as before.
 */
export function AnimatedText({ text, className, as = 'span' }: AnimatedTextProps) {
  return (
    <ScrollRevealText
      as={as}
      segments={[{ text }]}
      className={cn('inline-block', className)}
    />
  );
}
