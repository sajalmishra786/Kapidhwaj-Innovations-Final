import { motion } from 'framer-motion';
import type { HeroCard } from '@/data/content';
import { CARD_THEME, HeroCardArt } from './HeroCardArt';

const RADIUS_RATIO = 0.08;
const LABEL_RATIO = 0.038;
const TITLE_RATIO = 0.062;
const SHADOW_FADE_SECONDS = 0.6;

interface WorkCardProps {
  card: HeroCard;
  /** Rendered width in px — radius and type scale from this. */
  width: number;
  /** Titles are dropped on cards too narrow to show them legibly. */
  showText: boolean;
  /** Seconds before the card's shadow fades in; 0 shows it from the first frame. */
  shadowDelay: number;
}

/**
 * One poster-style card in the fan: artwork, a sheen, and a label + title.
 *
 * The shadow is its own layer so it can arrive late. While the cards are still
 * stacked on top of each other, seven large soft shadows on one spot pile up
 * into visible banding; only the front card carries one until the rest deal out.
 */
export function WorkCard({ card, width, showText, shadowDelay }: WorkCardProps) {
  const theme = CARD_THEME[card.id];
  const radius = Math.round(width * RADIUS_RATIO);

  return (
    <div className="relative h-full w-full">
      <motion.div
        aria-hidden
        initial={shadowDelay > 0 ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: SHADOW_FADE_SECONDS, delay: shadowDelay }}
        className="absolute inset-0 shadow-[0_26px_50px_-22px_rgba(23,21,15,0.6),0_3px_8px_rgba(23,21,15,0.14)]"
        style={{ borderRadius: radius }}
      />

      <div
        className="relative h-full w-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-black/5"
        style={{ background: theme.bg, color: theme.fg, borderRadius: radius }}
      >
        <HeroCardArt id={card.id} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10"
        />

        {showText && (
          <>
            <span
              className="absolute left-[7%] top-[6%] font-mono uppercase tracking-[0.18em] opacity-75"
              style={{ fontSize: width * LABEL_RATIO }}
            >
              {card.label}
            </span>
            <span
              className="absolute bottom-[6%] left-[7%] font-display font-semibold leading-tight tracking-tight"
              style={{ fontSize: width * TITLE_RATIO }}
            >
              {card.title}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
