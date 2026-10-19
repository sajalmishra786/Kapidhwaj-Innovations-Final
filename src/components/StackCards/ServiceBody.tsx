import { motion } from 'framer-motion';
import type { ServiceCard } from '@/data/content';
import { fadeUp, scaleIn, stagger, inView } from '@/animations/motionVariants';
import { cn } from '@/lib/cn';
import { ServiceHeroCard } from './ServiceHeroCard';

interface ServiceBodyProps {
  service: ServiceCard;
  /** Reduced-motion layout: static, and there is no folder tab to clear. */
  reduced: boolean;
}

/**
 * Card content: kicker + title + description + capability chips | media preview.
 *
 * Spacing is driven by two variables owned by the stack frame so the content can
 * never drift out from under the folder tab:
 *
 *  - `--body-pad`    the card's inner padding, stepped up per breakpoint; from `lg`
 *                    it tracks the viewport height, since height is what a
 *                    laptop card is short of.
 *  - `--card-radius` how far the tab laps onto the body. The top padding is never
 *                    allowed below `radius + 0.75rem`, so the first text line
 *                    always starts clear of the tab. (It used to be a flat 1.25rem
 *                    on phones — 0.5rem *inside* the tab's overlap — which sliced
 *                    the top off the kicker under whichever slot it sat in.)
 *
 * Below `lg` the media panel is gone, so a service badge and an oversized index
 * numeral take its place; they anchor the card and absorb the spare height a
 * viewport-sized card has on tall phones and tablets, instead of leaving blank
 * colour.
 */
export function ServiceBody({ service, reduced }: ServiceBodyProps) {
  const Icon = service.icon;
  const motionProps = reduced
    ? {}
    : { variants: stagger(0.08), initial: 'hidden' as const, whileInView: 'visible' as const, viewport: inView };

  return (
    <div
      className={cn(
        'relative grid h-full grid-cols-1 gap-6 sm:gap-8 md:grid-cols-[1fr_0.82fr] lg:gap-[clamp(1.5rem,4svh,2.5rem)]',
        '[--body-pad:1.25rem] sm:[--body-pad:2rem] sm:max-lg:short:[--body-pad:1.5rem] lg:[--body-pad:clamp(1.5rem,4.2svh,3.5rem)]',
        'p-[var(--body-pad)]',
        reduced ? '' : 'pt-[max(var(--body-pad),calc(var(--card-radius)+0.75rem))]',
      )}
    >
      {/* oversized index — fills the spare height of the pinned card on mobile */}
      {!reduced && (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-5 -right-2 select-none font-display text-[clamp(8.5rem,20svh,11rem)] font-bold leading-none tracking-tighter text-ink-950/[0.07] sm:-bottom-8 sm:text-[13rem] md:hidden"
        >
          {service.index}
        </span>
      )}

      {/* text column — copy sits at the top and chips anchor the bottom */}
      <motion.div className="relative z-10 flex h-full flex-col justify-between" {...motionProps}>
        <div>
          <div className="flex items-center justify-between gap-4">
            {/* verb kicker — the punchy service identity */}
            <motion.span
              variants={reduced ? undefined : fadeUp}
              className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-ink-950/55 sm:text-xs sm:tracking-[0.3em]"
            >
              {service.name}
            </motion.span>

            <motion.span
              variants={reduced ? undefined : fadeUp}
              aria-hidden
              className="flex h-9 w-9 max-sm:short:h-8 max-sm:short:w-8 shrink-0 items-center justify-center rounded-full bg-ink-950/[0.07] text-base text-ink-950/80 ring-1 ring-ink-950/10 sm:h-10 sm:w-10 sm:text-lg md:hidden"
            >
              <Icon />
            </motion.span>
          </div>

          <motion.h3
            variants={reduced ? undefined : fadeUp}
            className="mt-2.5 font-display text-[1.5rem] font-bold leading-[1.06] tracking-tight text-ink-950 sm:mt-3 sm:text-4xl sm:leading-[1.05] md:max-lg:text-[clamp(1.95rem,2.9vw,2.4rem)] lg:text-[clamp(1.75rem,4.6svh,3.25rem)] max-sm:short:mt-2 max-sm:short:text-[1.35rem] md:max-lg:short:text-[1.6rem]"
          >
            {service.title}
          </motion.h3>

          <motion.p
            variants={reduced ? undefined : fadeUp}
            className="mt-3.5 max-w-md text-[0.9375rem] leading-[1.55] text-ink-950/70 sm:mt-4 sm:text-base sm:leading-relaxed md:max-lg:text-[clamp(0.9rem,1.25vw,1rem)] lg:max-w-[clamp(28rem,62svh,36rem)] lg:text-[clamp(0.875rem,1.9svh,1.1875rem)] lg:leading-[1.55] max-sm:short:mt-2 max-sm:short:text-[0.85rem] max-sm:short:leading-[1.5] md:max-lg:short:mt-3 md:max-lg:short:text-[0.875rem]"
          >
            {service.description}
          </motion.p>
        </div>

        {/* capability chips */}
        <motion.ul
          variants={reduced ? undefined : fadeUp}
          className="mt-3.5 flex flex-wrap items-center gap-1.5 sm:mt-5 sm:gap-2 md:mt-auto md:pt-3 max-sm:short:mt-3"
        >
          {service.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full bg-ink-950/[0.08] px-3 py-1 text-[0.72rem] font-medium text-ink-950/75 ring-1 ring-ink-950/10 sm:px-3.5 sm:py-1.5 sm:text-xs"
            >
              {chip}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* media preview column */}
      <motion.div
        variants={reduced ? undefined : scaleIn}
        initial={reduced ? undefined : 'hidden'}
        whileInView={reduced ? undefined : 'visible'}
        viewport={inView}
        className="hidden min-h-0 md:block"
      >
        <ServiceMedia service={service} />
      </motion.div>
    </div>
  );
}

/**
 * Product-preview panel: themed gradient + grain + a floating glass card matching reference design.
 */
function ServiceMedia({ service }: { service: ServiceCard }) {
  const { hue } = service;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[1.25rem]"
      style={{ background: `linear-gradient(150deg, hsl(${hue} 65% 95%), hsl(${hue + 25} 58% 79%))` }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07] mix-blend-soft-light"
        aria-hidden
      >
        <filter id={`grain-${service.index}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${service.index})`} />
      </svg>

      {/* soft glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/55 blur-3xl" />

      {/* hero-style poster card with clearance for stacked card tabs */}
      <div className="absolute inset-4 bottom-6 flex flex-col xl:inset-5 xl:bottom-7">
        <ServiceHeroCard service={service} />
      </div>
    </div>
  );
}
