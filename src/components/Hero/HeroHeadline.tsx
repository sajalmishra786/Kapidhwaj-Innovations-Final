import { Fragment } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT_EXPO, HERO_TIMING } from './heroMotion';

const wordVariants: Variants = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(10px)' },
  show: (index: number) => ({
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: EASE_OUT_EXPO,
      delay: HERO_TIMING.headline + index * HERO_TIMING.wordStagger,
    },
    // Once a word has landed, drop the filter entirely so it isn't left on its
    // own compositing layer for the life of the page.
    transitionEnd: { filter: 'none' },
  }),
};

interface Word {
  text: string;
  /** True for the first word of every line after the first. */
  startsNewLine: boolean;
}

function toWords(lines: readonly string[]): Word[] {
  return lines.flatMap((line, lineIndex) =>
    line.split(' ').map((text, wordIndex) => ({
      text,
      startsNewLine: lineIndex > 0 && wordIndex === 0,
    })),
  );
}

interface HeroHeadlineProps {
  /** Lines as they break on wide screens; narrower screens reflow the words. */
  lines: readonly string[];
}

/** The hero h1 — each word fades up out of a blur, in reading order. */
export function HeroHeadline({ lines }: HeroHeadlineProps) {
  const reduced = useReducedMotion();
  const words = toWords(lines);

  return (
    <motion.h1
      initial={reduced ? false : 'hidden'}
      animate="show"
      className="max-w-[18ch] text-balance text-center font-display text-[clamp(2.25rem,min(7.2vw,9.2svh),5.75rem)] font-medium leading-[1.02] tracking-[-0.04em] text-ink-950 md:max-w-none"
    >
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && ' '}
          {word.startsNewLine && <br className="hidden md:block" />}
          <motion.span variants={wordVariants} custom={index} className="inline-block">
            {word.text}
          </motion.span>
        </Fragment>
      ))}
    </motion.h1>
  );
}
