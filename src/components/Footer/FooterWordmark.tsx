import { motion, type Variants } from 'framer-motion';
import { stagger } from '@/animations/motionVariants';
import { useFontLoaded } from '@/hooks/useFontLoaded';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FooterFlag } from './FooterFlag';

const WORDMARK_FONT = '700 1em "Space Grotesk"';

const LETTERS = ['K', 'a', 'p', 'i', 'd', 'h', 'w', 'a', 'j'] as const;

/** The letter the flag is planted on — an ascender, so it has a clean top to stand on. */
const FLAG_LETTER_INDEX = 4;

/**
 * The name always sits on one line, edge to edge. Its font-size is `100cqw / em`, where `em`
 * is the measured advance width of "Kapidhwaj." in Space Grotesk 700 with the tracking below
 * (4.84em) plus a little slack for fallback fonts. On a short, wide screen the viewport
 * height caps it, so the wordmark never pushes the footer past one frame.
 */
const FONT_SIZE = 'text-[length:min(calc(100cqw/4.95),28svh)]';

/** Each letter's hover tint, cycling through the brand accents. */
const HOVER_TINTS = [
  'hover:text-accent-cyan',
  'hover:text-accent-violet',
  'hover:text-accent-ember',
] as const;

const riseIntoPlace: Variants = {
  hidden: { y: '45%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

interface LetterProps {
  letter: string;
  /** Position in the word — drives the hover tint. */
  position: number;
  withFlag?: boolean;
}

function Letter({ letter, position, withFlag = false }: LetterProps) {
  return (
    <motion.span variants={riseIntoPlace} className="relative block">
      <span
        className={`relative block transition-[color,transform] duration-300 ease-out-expo hover:-translate-y-[3%] ${HOVER_TINTS[position % HOVER_TINTS.length]}`}
      >
        {letter}
        {withFlag && <FooterFlag />}
      </span>
    </motion.span>
  );
}

/**
 * Oversized brand wordmark that closes the page. Decorative: the accessible
 * brand name lives in the footer's brand column.
 *
 * Bottom padding keeps the baseline clear of the fixed navigation dock
 * (~6rem tall including its offset), so the dock never sits over the letters.
 */
export function FooterWordmark() {
  const reduced = useReducedMotion();
  // The flag is placed from Space Grotesk's glyph metrics, so it only appears once that exact
  // font is in; on a fallback face it would hover beside the stem instead of standing on it.
  const showFlag = useFontLoaded(WORDMARK_FONT);

  return (
    <div
      aria-hidden
      className="mx-auto w-full max-w-[100rem] px-[clamp(1rem,3vw,3rem)] pt-[clamp(0.5rem,2svh,1.25rem)] [container-type:inline-size]"
    >
      <motion.div
        variants={stagger(0.05)}
        initial={reduced ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className={`flex select-none items-start justify-center pb-[max(1.5rem,calc(6rem-0.154em))] pt-[0.26em] font-display font-bold leading-none tracking-[-0.045em] text-ink-950 ${FONT_SIZE}`}
      >
        {LETTERS.map((letter, index) => (
          <Letter
            key={`${letter}-${index}`}
            letter={letter}
            position={index}
            withFlag={index === FLAG_LETTER_INDEX && showFlag}
          />
        ))}
        <motion.span variants={riseIntoPlace} className="block">
          {/* Right padding: the negative tracking narrows this box below the glyph, and
              `background-clip: text` only paints inside the box — without it the dot is cut flat. */}
          <span className="text-gradient pr-[0.06em]">.</span>
        </motion.span>
      </motion.div>
    </div>
  );
}
