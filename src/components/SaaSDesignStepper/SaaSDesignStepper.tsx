import { useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { STEPPER_CONTENT } from './content';
import { ProgressMeter } from './ProgressMeter';
import { StepPreview } from './StepPreview';
import { useStepProgress } from './useStepProgress';
import { ScrollRevealText } from '@/components/ui/ScrollRevealText';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TOTAL = STEPPER_CONTENT.length;
/** Scroll distance allotted to each step, in viewport heights. */
const SCROLL_PER_STEP_VH = 90;
const EASE = [0.22, 1, 0.36, 1] as const;

export function SaaSDesignStepper() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeStep, scrollToStep } = useStepProgress(containerRef, TOTAL);

  const progress = Math.round(((activeStep + 1) / TOTAL) * 100);
  const step = STEPPER_CONTENT[activeStep];
  const nextStep = STEPPER_CONTENT[(activeStep + 1) % TOTAL];

  return (
    <div ref={containerRef} className="relative" style={{ height: `${TOTAL * SCROLL_PER_STEP_VH}vh` }}>
      {/*
        Pinned stage. The content is centred in what the floating nav leaves free
        (--dock-gap kept clear at the bottom, a small margin at the top) — it used
        to sit under asymmetric padding, so it rode low, and on a short screen it
        was taller than that space: the heading jammed against the top edge and the
        card ran under the nav.

        The stage deliberately does not clip vertically. `overflow-hidden` here
        sliced the card's shadow along a straight line wherever the stage met the
        next section; only the sideways travel of the columns needed containing,
        and `overflow-x-clip` does that without touching the vertical axis.
      */}
      <div className="sticky top-0 flex h-[100svh] items-center overflow-x-clip px-4 pb-[var(--dock-gap)] pt-6 [--dock-gap:5.5rem] sm:px-6 md:px-8">
        <div className="mx-auto w-full max-w-5xl lg:max-w-[clamp(60rem,130svh,72rem)]">
          {/* Header */}
          <div className="mb-[clamp(1.25rem,3.5svh,2.5rem)] flex flex-col gap-4 max-sm:short:gap-2 sm:gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
            <div>
              <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-900/40">
                How we work
              </p>
              <ScrollRevealText
                as="h2"
                className="font-display text-[1.9rem] font-medium tracking-tight text-ink-900 sm:text-4xl md:text-[2.25rem] lg:text-5xl"
                segments={[{ text: 'Our Development Process' }]}
              />
            </div>
            <ProgressMeter
              steps={STEPPER_CONTENT}
              activeStep={activeStep}
              progress={progress}
              reduced={reduced}
              onStepClick={scrollToStep}
            />
          </div>

          {/*
            Fixed-height content card. The height is constant across steps so the
            box never resizes with the copy; it follows the viewport height (within
            limits) so it neither overflows a short screen nor floats in a tall one.
            Steps change inside an AnimatePresence with no layout reflow.
          */}
          <div className="relative h-[var(--card-h)] overflow-hidden rounded-[2rem] bg-[#F1EFE9] p-3 shadow-[0_30px_80px_-50px_rgba(23,21,15,0.45)] ring-1 ring-ink-900/[0.06] [--card-h:clamp(21rem,48svh,26rem)] max-sm:short:[--card-h:clamp(20rem,46svh,26rem)] md:p-4 md:[--card-h:clamp(20rem,56svh,34rem)]">
            <AnimatePresence initial={false}>
              <motion.div
                key={activeStep}
                initial="enter"
                animate="center"
                exit="exit"
                variants={reduced ? REDUCED_PANE : PANE}
                className="absolute inset-3 grid items-stretch gap-3 md:inset-4 md:grid-cols-[1.05fr_0.95fr]"
              >
                {/* Left: copy */}
                <motion.div
                  variants={reduced ? FADE : columnVariants(-1)}
                  className="flex min-w-0 flex-col justify-center px-5 py-5 max-sm:short:px-4 max-sm:short:py-3 md:px-10 md:py-[clamp(1rem,4svh,2.5rem)]"
                >
                  <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-900/40 sm:mb-3">
                    Phase / {step.id}
                  </p>
                  <h3 className="font-display text-[1.5rem] font-medium leading-[1.12] tracking-tight text-ink-900 max-sm:short:text-[1.3rem] sm:text-[1.75rem] sm:leading-[1.08] lg:text-[clamp(1.5rem,4.4svh,2.25rem)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[0.88rem] leading-[1.55] text-ink-900/65 max-sm:short:mt-2 max-sm:short:text-[0.8rem] max-sm:short:leading-[1.45] sm:mt-4 sm:text-[0.95rem] sm:leading-relaxed md:text-[clamp(0.875rem,2svh,1rem)]">
                    {step.description}
                  </p>

                  {step.deliverable && (
                    <p className="mt-2.5 max-w-md text-[0.82rem] leading-relaxed text-ink-900/75 sm:mt-3 sm:text-[0.88rem]">
                      <span className="font-semibold text-ink-900">Deliverable:</span>{' '}
                      {step.deliverable}
                    </p>
                  )}

                  <div className="mt-6 hidden items-center gap-2.5 border-t border-ink-900/[0.08] pt-5 text-[0.8rem] text-ink-900/45 md:flex short:md:hidden">
                    <span className="font-semibold uppercase tracking-[0.18em]">Next</span>
                    <span className="text-ink-900/30">→</span>
                    <span className="truncate font-medium text-ink-900/60">{nextStep.title}</span>
                  </div>
                </motion.div>

                {/* Right: premium preview (hidden on small screens where the box stacks) */}
                <motion.div
                  variants={reduced ? FADE : columnVariants(1)}
                  className="hidden min-h-[14rem] md:block"
                >
                  <StepPreview id={step.id} title={step.title} Icon={step.icon} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  The motion is the same as it always was — each column slides in from its own
  outer edge (copy from the left, preview from the right) and slides back out the
  same way — with only the timing smoothed:

  - the outgoing step leaves *fast* (0.2s, fading from the first frame), and the
    incoming one starts a beat later, so the two are never legible at once;
    before, both sat on screen together and printed over each other;
  - the two columns arrive one after the other, copy first.

  Transform + opacity only.
*/
const PANE: Variants = {
  center: { transition: { delayChildren: 0.12, staggerChildren: 0.07 } },
};

function columnVariants(dir: -1 | 1): Variants {
  const shift = 28 * dir;
  return {
    enter: { opacity: 0, x: shift },
    center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
    exit: { opacity: 0, x: shift * 0.6, transition: { duration: 0.2, ease: 'easeOut' } },
  };
}

/** Reduced motion: no travel, no stagger — a short crossfade. */
const REDUCED_PANE: Variants = { center: {} };
const FADE: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};
