import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { SCENES, type Scene } from '@/data/content';

/**
 * Scroll-driven storytelling. A 400vh track with a sticky viewport; the
 * scroll progress (0→1) is sliced into four scenes that cross-fade and
 * transform with depth. All motion is opacity/transform/scale.
 */
export function StorytellingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Background zoom & rotate over the whole track for continuity.
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* depth backdrop */}
        <motion.div
          style={{ scale: bgScale, rotate: bgRotate }}
          className="pointer-events-none absolute inset-0 will-change-transform"
        >
          <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink-900/10" />
          <div className="absolute left-1/2 top-1/2 h-[45vmin] w-[45vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink-900/10" />
          <div className="absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-violet/10 blur-[120px]" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center [perspective:1000px]">
          {SCENES.map((scene, i) => (
            <SceneBlock
              key={scene.title}
              scene={scene}
              index={i}
              total={SCENES.length}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* scene progress rail */}
        <div className="absolute bottom-28 left-1/2 h-0.5 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-ink-900/10">
          <motion.div
            style={{ width: progressWidth }}
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-violet"
          />
        </div>
      </div>
    </div>
  );
}

interface SceneBlockProps {
  scene: Scene;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function SceneBlock({ scene, index, total, progress }: SceneBlockProps) {
  const slice = 1 / total;
  const start = index * slice;
  const end = start + slice;
  // Fade in over the first 30% of the slice, hold, fade out over last 30%.
  const opacity = useTransform(
    progress,
    [start, start + slice * 0.3, end - slice * 0.3, end],
    [0, 1, 1, 0],
  );
  const y = useTransform(progress, [start, end], [60, -60]);
  const scale = useTransform(
    progress,
    [start, start + slice * 0.3, end - slice * 0.3, end],
    [0.92, 1, 1, 0.96],
  );

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 will-change-transform"
    >
      <span className="eyebrow">{scene.eyebrow}</span>
      <h2 className="mt-5 text-display font-semibold text-ink-900">{scene.title}</h2>
      <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ink-900/55">
        {scene.body}
      </p>
    </motion.div>
  );
}
