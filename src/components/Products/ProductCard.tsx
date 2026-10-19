import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { fadeUp } from '@/animations/motionVariants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Product } from '@/data/content';

const TILT_SPRING = { stiffness: 320, damping: 30 } as const;

/**
 * Glass product card with cursor-tracked 3D tilt, glow border, and a
 * reactive background highlight. Tilt is disabled under reduced motion.
 */
export function ProductCard({ product }: { product: Product }) {
  const Icon = product.icon;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), TILT_SPRING);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), TILT_SPRING);
  const glowX = useTransform(mx, [0, 1], ['0%', '100%']);
  const glowY = useTransform(my, [0, 1], ['0%', '100%']);

  const onMove = (event: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width);
    my.set((event.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.article
      ref={ref}
      variants={fadeUp}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group glass relative flex min-h-[320px] flex-col overflow-hidden rounded-[2rem] p-10 will-change-transform"
    >
      {/* reactive highlight follows cursor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ left: glowX, top: glowY, background: product.accent }}
      />
      {/* glow border on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-glass opacity-0 ring-1 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${product.accent}55` }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110"
            style={{ background: `${product.accent}1a`, color: product.accent }}
          >
            <Icon aria-hidden />
          </span>
          <span className="rounded-full px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest" style={{ background: `${product.accent}0f`, color: product.accent }}>
            {product.tagline}
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <h3 className="font-display text-3xl font-semibold tracking-tight text-ink-950">
            {product.title}
          </h3>
          <p className="text-base leading-relaxed text-ink-800/70">
            {product.description}
          </p>
        </div>
        
        {/* Subtle arrow indicator on hover */}
        <div className="mt-auto pt-8">
          <span 
            className="inline-flex items-center gap-2 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-x-1" 
            style={{ color: product.accent }}
          >
            Explore <span className="text-lg">→</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
