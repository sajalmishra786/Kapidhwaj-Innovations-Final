import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { GALLERY } from '@/data/content';
import { fadeUp, inView } from '@/animations/motionVariants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GalleryCard } from './GalleryCard';

/**
 * Selected work — a pinned, scroll-driven gallery.
 *
 * A tall outer track pins an inner viewport-height stage. As the user scrolls,
 * a smoothed 0→1 progress drives the cards from a scattered, tilted pile at the
 * bottom up into a clean responsive grid, while the heading settles in parallel.
 * Under prefers-reduced-motion the stage collapses to a plain, fading grid.
 */
export function WaveGallery() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  // Spring-smooth the raw scroll so the arrange never feels mechanical.
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.0005,
  });

  const headingScale = useTransform(progress, [0, 0.5], [1.06, 1]);
  const headingOpacity = useTransform(progress, [0, 0.4], [0.55, 1]);
  const headingY = useTransform(progress, [0, 0.5], ['18px', '0px']);

  if (reduced) {
    return (
      <div className="w-full px-6 py-24 sm:py-32">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mb-12 text-center sm:mb-16"
        >
          <GalleryHeading />
        </motion.div>
        <GalleryGrid progress={progress} reduced />
      </div>
    );
  }

  /* Transparent: the dark chapter's surface shows through. */
  return (
    <div ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-start overflow-hidden px-4 pb-24 pt-12 sm:justify-center sm:pb-16 sm:pt-6">
        <motion.div
          style={{ scale: headingScale, opacity: headingOpacity, y: headingY }}
          className="mb-6 text-center sm:mb-14"
        >
          <GalleryHeading />
        </motion.div>

        <GalleryGrid progress={progress} reduced={false} />
      </div>
    </div>
  );
}

function GalleryHeading() {
  return (
    <>
      <span className="eyebrow">Selected work</span>
      <h2 className="mt-3 font-display text-[2rem] font-semibold tracking-tight text-cream-100 sm:mt-4 sm:text-6xl lg:text-7xl">
        Products &amp; <span className="text-gradient">platforms</span>
      </h2>
      <p className="mx-auto mt-3 max-w-md text-balance text-xs font-medium text-cream-100/60 sm:mt-5 sm:text-base">
        A selection of exceptional SaaS products we are working on
      </p>
    </>
  );
}

interface GalleryGridProps {
  progress: MotionValue<number>;
  reduced: boolean;
}

function GalleryGrid({ progress, reduced }: GalleryGridProps) {
  return (
    <div className="mx-auto grid w-full max-w-[88rem] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-5">
      {GALLERY.map((item, index) => (
        <GalleryCard
          key={item.title}
          item={item}
          index={index}
          total={GALLERY.length}
          progress={progress}
          reduced={reduced}
        />
      ))}
    </div>
  );
}
