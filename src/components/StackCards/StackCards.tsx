import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { SERVICES } from '@/data/content';
import { fadeUp, inView } from '@/animations/motionVariants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { ServiceBody } from './ServiceBody';

const TOTAL = SERVICES.length;
const SLOT = 100 / TOTAL; // each tab occupies an equal slice of the card width

/**
 * Content frame shared by the masthead and the cards so their edges line up.
 * From `lg` the width follows the viewport *height* (1.3 × `svh`, between 60rem
 * and 72rem) rather than its width: a card only ever gets about 440px of height
 * on a laptop, so a width-driven frame stretched it into a long strip. 60rem is
 * the floor because it still leaves each of the six tab slots wide enough for
 * "Service / 0X".
 */
const FRAME = 'mx-auto w-full max-w-5xl lg:max-w-[clamp(60rem,130svh,72rem)]';

/**
 * The stack's vertical metrics, as variables so the masthead, tabs, body and
 * content all read from one place (they used to be four unrelated magic numbers
 * that drifted apart — see `ServiceBody` for the clipping that caused).
 *
 *  --stack-top    pinned masthead height; the card track starts beneath it. On
 *                 landscape screens it is a fixed share of the viewport height.
 *                 In portrait (`md` up) it is --stack-top-centred instead, which
 *                 drops the masthead so heading, gap and card are centred as one
 *                 group (see STACK_CALC). Left at the landscape value, a tall
 *                 tablet pinned the heading to the top edge with the card a
 *                 quarter-screen away in the middle.
 *  --head-h       height of the masthead's eyebrow + title (see STACK_CALC)
 *  --tab-gap      clear space between the masthead and the top of the tabs in
 *                 portrait, where the card is top-aligned under the heading
 *  --tab-rise     how far a tab stands above its card body
 *  --card-radius  body corner radius, and how far the tab laps onto the body to
 *                 fill that corner
 *  --dock-gap     space kept clear at the bottom for the fixed navigation dock
 *  --card-max     tallest a card may grow. Single-column cards (phones) track the
 *                 viewport height, so a tall phone gets a taller card. From `md`
 *                 the card is two-column — copy beside a media panel — and is
 *                 capped at the desktop proportions instead: a tablet held in
 *                 portrait has plenty of height, but spending it on the card
 *                 stretched it into a near-square with the media panel pulled
 *                 into a tall strip. The spare height stays around the card and
 *                 the slot centres it.
 */
const STACK_VARS = [
  '[--stack-top:7rem] [--tab-gap:2.5rem] [--tab-rise:3.25rem] [--card-radius:1.5rem] [--dock-gap:5.5rem] [--card-max:clamp(28rem,60svh,36rem)]',
  'sm:[--stack-top:8rem] sm:[--tab-rise:3.25rem] sm:[--card-max:clamp(30rem,62svh,46rem)]',
  // two-column from `md`: a landscape card, whatever the orientation
  'md:[--card-max:clamp(27.5rem,48svh,31.5rem)]',
  // portrait has height to spare: the masthead drops to sit just above the card
  'md:portrait:[--stack-top:var(--stack-top-centred)]',
  // from `lg` the card height scales with the viewport height; on landscape so
  // does the masthead
  'lg:landscape:[--stack-top:clamp(7.5rem,15svh,10rem)] lg:[--card-max:clamp(24rem,56svh,36rem)]',
].join(' ');

/** Solid cream that dissolves into transparent over the bar's last 2rem. */
const MASTHEAD_BACKGROUND = {
  background:
    'linear-gradient(to bottom, var(--color-cream-100) calc(100% - 2rem), transparent)',
} as CSSProperties;

/**
 * Stack metrics that are arithmetic on the others. Written in viewport units
 * rather than percentages so they resolve identically wherever they are used.
 *
 *  --head-h          the masthead's eyebrow line plus its title.
 *  --body-h          card height: fill what the viewport leaves under the
 *                    masthead, the tab and the dock's clearance, but never grow
 *                    past --card-max.
 *  --stack-top-centred  the masthead height that centres heading + gap + card as
 *                    one group above the dock in portrait tab view.
 */
const STACK_CALC = {
  '--head-h': 'calc(1.65rem + 1.02 * clamp(2rem, 5.5vw, 3.5rem))',
  '--body-h':
    'min(calc(100svh - var(--stack-top) - var(--tab-rise) - var(--dock-gap)), var(--card-max))',
  '--stack-top-centred':
    'max(8rem, calc((100svh - var(--dock-gap) + var(--head-h) - var(--tab-gap) - var(--tab-rise) - var(--card-max)) / 2 + 1rem))',
} as CSSProperties;

/**
 * Service stack (shinta.framer style) — compact cards slide up and pin, each
 * leaving a colored "SERVICE / 0X" folder tab in an accumulating row at the top.
 *
 * Mechanism: an "Our Services" masthead pins to the top of the viewport for the
 * whole section, and every card is `sticky` directly beneath it inside one tall
 * track with an increasing z-index. Each card's tab is a fixed slot, so the tabs
 * tile left-to-right; the body is full-width below the tab row, so later bodies
 * cover earlier ones while every tab stays visible. The masthead outranks all of
 * them on z so the cards slide *under* the title rather than over it. Reduced-motion users get a plain, fully-readable vertical stack under the
 * same heading.
 */
export function StackCards() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="relative bg-cream-100">
        <StackBackdrop />
        <div className={cn(FRAME, 'relative px-4 pb-16 sm:px-6')}>
          <SectionMasthead />
          <div className="space-y-6">
            {SERVICES.map((service) => (
              <div
                key={service.index}
                className="overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_-36px_rgba(23,21,15,0.4)] ring-1 ring-black/[0.04]"
              >
                <div className="flex h-12 items-center px-7" style={{ background: service.color }}>
                  <TabLabel index={service.index} variant="full" />
                </div>
                <div style={{ background: service.color }}>
                  <ServiceBody service={service} reduced />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative bg-cream-100', STACK_VARS)} style={STACK_CALC}>
      <StackBackdrop />

      {/*
        The masthead is sticky inside its own absolutely-positioned track rather
        than inside the section, and that track stops one card short of the
        section's end.

        Sticky releases when its container's bottom edge catches up, so a masthead
        parented to the whole section stayed pinned for one full card-height after
        the sixth card had arrived — hanging over the last card while it scrolled
        away underneath. Ending the track at `100% − (100svh − --stack-top)` puts
        its release on exactly the same scroll position as the final card's, so
        the two leave together.

        The track is `absolute`, so a spacer below restores the height the
        masthead used to contribute to the flow. It spans most of the section, so
        it has to be transparent to the pointer or it would swallow every hover
        and click over the cards underneath; the bar itself takes them back.

        The bar is solid cream that dissolves over its last 2rem (see
        MASTHEAD_BACKGROUND), so cards slide out from under it gradually. A flat
        bar left a hard line across the page — against the grid and the violet
        wash behind it, and straight through every card passing underneath. It is
        also cheaper than the blur it replaced: a full-width backdrop-filter
        repainting every frame is the most reliable way to make a scroll-pinned
        section stutter.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-40"
        style={{ height: 'calc(100% - (100svh - var(--stack-top)))' }}
      >
        <div
          className="pointer-events-auto sticky top-0 h-[var(--stack-top)] px-4 sm:px-6"
          style={MASTHEAD_BACKGROUND}
        >
          <div className={cn(FRAME, 'flex h-full items-end pb-7 sm:pb-8')}>
            <SectionMasthead pinned />
          </div>
        </div>
      </div>
      <div aria-hidden className="h-[var(--stack-top)]" />

      {SERVICES.map((service, i) => (
        <div
          key={service.index}
          className="sticky top-[var(--stack-top)] flex h-[calc(100svh-var(--stack-top))] items-center px-4 pb-[var(--dock-gap)] sm:px-6 md:portrait:items-start md:portrait:pt-[var(--tab-gap)]"
          style={{ zIndex: i + 1 }}
        >
          <div className={cn(FRAME, 'relative')} style={{ height: 'calc(var(--tab-rise) + var(--body-h))' }}>
            {/* body (rendered first so the tab can sit on top of it). It fills the
                frame below the tab; the frame itself is what the slot centres. It
                casts no shadow of its own — six of them stacked into dark streaks
                along the edges; the shared plate below provides the depth. */}
            <div
              className="absolute inset-x-0 bottom-0 top-[var(--tab-rise)] overflow-hidden rounded-[var(--card-radius)] ring-1 ring-black/[0.05]"
              style={{ background: service.color }}
            >
              <ServiceBody service={service} reduced={false} />
            </div>

            {/* folder tab — laps onto the body by --card-radius so tab and body
                read as one connected shape (the lap fills the body's rounded
                corner); the label is centred in the part that stands proud */}
            <div
              className="absolute top-0 flex h-[calc(var(--tab-rise)+var(--card-radius))] items-center overflow-hidden rounded-t-[1.25rem] pb-[var(--card-radius)] pl-2.5 sm:pl-3 md:pl-3.5 lg:pl-5"
              style={{ left: `${i * SLOT}%`, width: `${SLOT}%`, background: service.color }}
            >
              <TabLabel index={service.index} />
            </div>

            {/* The ambient drop shadow, drawn once. The first card stays pinned for
                the whole section, so it hosts a transparent plate shaped like the
                body (a box-shadow only paints outside its box) behind every card.
                Giving each of the six cards its own 90px-blur shadow stacked them
                into a heavy dark band under the pile, with a stepped, hard-looking
                tail where the blur ran out. */}
            {i === 0 && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 top-[var(--tab-rise)] -z-10 rounded-[var(--card-radius)] shadow-[0_34px_90px_-44px_rgba(23,21,15,0.5)]"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * "Our Services" masthead — eyebrow over title, nothing else. It carried a
 * supporting line on wide screens, but the cards immediately below already spell
 * out what the six disciplines are, so it was restating them a second before the
 * reader got the real answer.
 *
 * `pinned` is the compact variant used in the sticky bar; the default is the
 * taller variant for the reduced-motion layout, where there is no
 * viewport-height budget to respect.
 */
function SectionMasthead({ pinned = false }: { pinned?: boolean }) {
  if (!pinned) {
    return (
      <div className="pb-10 pt-16 sm:pb-12 sm:pt-20">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-ink-950/45">
          What we do
        </span>
        <h2 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink-900">
          Our Services
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.span
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-ink-950/45 sm:text-xs"
      >
        What we do
      </motion.span>
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="mt-2 font-display text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink-900 lg:text-[clamp(2rem,5.2svh,3.5rem)]"
      >
        Our Services
      </motion.h2>
    </div>
  );
}

/**
 * Backdrop for the stack. The flat cream read as empty behind the floating
 * folders, so this lays a faint blueprint grid plus two soft warm/violet washes
 * underneath — enough surface texture to sit the cards on, low-contrast enough
 * that it never competes with them.
 */
function StackBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(23,21,15,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,21,15,0.045) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 55% at 50% 40%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 55% at 50% 40%, #000 30%, transparent 100%)',
        }}
      />
      <div className="absolute -left-24 top-[12%] h-[32rem] w-[32rem] rounded-full bg-accent-violet/[0.07] blur-[110px]" />
      <div className="absolute -right-24 bottom-[8%] h-[30rem] w-[30rem] rounded-full bg-accent-ember/[0.06] blur-[110px]" />
    </div>
  );
}

interface TabLabelProps {
  index: string;
  variant?: 'auto' | 'full';
}

/**
 * Tab label. As tabs tile into equal slices, each slot shrinks with the service
 * count and the screen — six tabs on a phone leave ~55px per slot, far too
 * little for the full word. `variant="auto"` (the tiled tabs) therefore collapses
 * to a bare index number below `lg` and only spells out "Service / 0X" once the
 * slot is wide enough; `min-w-0` + `truncate` guarantee the label can never spill
 * into its neighbour. `variant="full"` is for the reduced-motion stack, whose
 * cards are full-width and always have room.
 */
function TabLabel({ index, variant = 'auto' }: TabLabelProps) {
  if (variant === 'full') {
    return (
      <span className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-ink-950">
        Service <span className="font-semibold text-ink-950/40">/ {index}</span>
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-baseline font-sans font-bold uppercase text-ink-950">
      {/* tab view & desktop: full folder label matching reference */}
      <span className="hidden truncate text-[0.68rem] tracking-[0.08em] sm:inline sm:text-[0.72rem] sm:tracking-[0.1em] md:text-[0.76rem] md:tracking-[0.12em] lg:text-sm lg:tracking-[0.2em]">
        Service <span className="font-semibold text-ink-950/40">/ {index}</span>
      </span>
      {/* narrow phone slots: compact numbered tab */}
      <span className="text-[0.8rem] tracking-[0.12em] sm:hidden">{index}</span>
    </span>
  );
}
