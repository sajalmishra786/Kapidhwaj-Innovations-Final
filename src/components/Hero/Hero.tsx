import type { MouseEvent } from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { HERO } from '@/data/content';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { scrollToSection } from '@/lib/scrollToSection';
import { AuroraBackground } from './AuroraBackground';
import { CardFan } from './CardFan';
import { EASE_OUT_EXPO, HERO_TIMING } from './heroMotion';
import { HeroHeadline } from './HeroHeadline';
import { useFontsReady } from './useFontsReady';

/** How far the primary button drifts toward the cursor (share of the offset). */
const MAGNET_STRENGTH = 0.2;

/** Brand logo mark — the Kapidhwaj temple-dome icon. */
function BrandMark() {
  return (
    <img
      src="/images/logo/Kapidhwaj Innovations_RGB_LogoMarkKapidhwaj Innovations_RGB_LogoMark.png"
      alt="Kapidhwaj Innovations logo"
      className="h-7 w-auto"
    />
  );
}

function goTo(target: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(target);
  };
}

/**
 * Landing hero: a centred two-line headline over a fan of work cards, with a
 * short description and two calls to action. All motion is a one-time entrance
 * plus hover/pointer response — nothing is driven by scroll.
 *
 * The page is exactly one screen tall and the fan takes whatever room the text
 * leaves, so the buttons stay clear of the bottom dock at any viewport height.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const fontsReady = useFontsReady();
  const magnet = useMagnetic<HTMLAnchorElement>(MAGNET_STRENGTH);

  const riseIn = (delay: number): MotionProps => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay },
  });

  /** Drifts up out of a soft blur into focus — the description and buttons, once the fan is open. */
  const focusIn = (delay: number): MotionProps => ({
    initial: reduced ? false : { opacity: 0, y: 14, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
    transition: { duration: 0.9, ease: EASE_OUT_EXPO, delay },
  });

  return (
    <div className="relative isolate flex h-[100svh] min-h-[36rem] flex-col overflow-hidden bg-cream-100 px-4 pb-24 pt-6 sm:px-8">
      <AuroraBackground />

      {/* Held until the fonts are in, so the entrance never plays on a fallback face. */}
      {fontsReady && (
        <>
          <motion.header {...riseIn(HERO_TIMING.brand)} className="relative z-10 flex items-center gap-2">
            <BrandMark />
            <span className="font-sans text-sm font-semibold tracking-tight text-ink-900">
              Kapidhwaj Innovations
            </span>
          </motion.header>

          <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col items-center justify-center gap-[clamp(0.5rem,2svh,1.5rem)] pt-4 text-center">
            <HeroHeadline lines={HERO.headline} />

            <CardFan />

            <motion.p
              {...focusIn(HERO_TIMING.description)}
              className="max-w-[42rem] text-[0.95rem] leading-relaxed text-ink-700 sm:text-base"
            >
              {HERO.description}
            </motion.p>

            <motion.div
              {...focusIn(HERO_TIMING.actions)}
              className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
            >
              <motion.a
                ref={magnet.ref}
                href={`#${HERO.primaryCta.target}`}
                onClick={goTo(HERO.primaryCta.target)}
                onMouseMove={magnet.onMouseMove}
                onMouseLeave={magnet.onMouseLeave}
                whileTap={{ scale: 0.97 }}
                style={{ x: magnet.x, y: magnet.y }}
                className="group inline-flex items-center gap-2 rounded-full bg-ink-800 px-7 py-3.5 text-sm font-medium text-cream-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_28px_-12px_rgba(58,53,39,0.7)] outline-none focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
              >
                {HERO.primaryCta.label}
                <FiArrowRight aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
              </motion.a>
              <a
                href={`#${HERO.secondaryCta.target}`}
                onClick={goTo(HERO.secondaryCta.target)}
                className="rounded-sm text-sm font-medium text-ink-900 underline decoration-ink-900/25 underline-offset-[6px] outline-none transition-colors duration-300 hover:text-accent-violet hover:decoration-accent-violet focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
              >
                {HERO.secondaryCta.label}
              </a>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
