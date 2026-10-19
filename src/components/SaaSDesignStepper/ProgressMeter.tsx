import { motion } from 'framer-motion';
import type { StepperItem } from './content';

const EASE = [0.22, 1, 0.36, 1] as const;

interface ProgressMeterProps {
  steps: StepperItem[];
  activeStep: number;
  /** Whole percent: 20, 40 … 100. */
  progress: number;
  reduced: boolean;
  onStepClick: (index: number) => void;
}

/** Premium segmented progress meter. Respects reduced motion: the fill snaps and the star holds still. */
export function ProgressMeter({ steps, activeStep, progress, reduced, onStepClick }: ProgressMeterProps) {
  return (
    <div className="flex w-full flex-col gap-3 pr-1.5 md:w-auto md:min-w-0 md:shrink-0">
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* track */}
        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-ink-900/[0.09] ring-1 ring-ink-900/5 md:w-60 lg:w-72 xl:w-80 md:flex-none">
          <motion.div
            aria-hidden
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ink-900 to-ink-700"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE }}
          />
          {/* segment ticks */}
          {steps.slice(1).map((step, i) => (
            <span
              key={step.id}
              aria-hidden
              className="absolute top-1/2 h-2.5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-cream-100"
              style={{ left: `${((i + 1) / steps.length) * 100}%` }}
            />
          ))}
        </div>

        {/* rotating star mark */}
        <motion.div
          aria-hidden
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-cream-50 shadow-md ring-[5px] ring-ink-900/[0.06]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6" />
          </svg>
        </motion.div>
      </div>

      {/* labels */}
      <div className="flex items-center justify-between gap-4 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-900/40 sm:text-[11px] sm:tracking-[0.18em] md:text-xs">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="mr-0.5 text-ink-900/55">Step</span>
          {steps.map((step, i) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(i)}
              aria-label={`Go to step ${step.id}: ${step.title}`}
              aria-current={activeStep === i ? 'step' : undefined}
              // The padding and matching negative margin grow the click target without moving anything.
              className={`-mx-0.5 -my-1.5 rounded px-0.5 py-1.5 tabular-nums outline-none transition-colors hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-ink-900/40 ${
                activeStep === i ? 'text-ink-900' : 'text-ink-900/35'
              }`}
            >
              {step.id}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-ink-900">
          <span className="text-ink-900/45">Progress</span>
          <span className="w-9 text-right tabular-nums">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
