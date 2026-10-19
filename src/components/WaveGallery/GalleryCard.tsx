import { useRef } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { GalleryItem } from '@/data/content';
import { fadeUp, inView } from '@/animations/motionVariants';

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  total: number;
  /** Smoothed 0→1 scroll progress of the pinned section. */
  progress: MotionValue<number>;
  /** When true, motion is skipped and the card simply fades into place. */
  reduced: boolean;
}

// Fan geometry — tuned to read as a scattered pile that rises into a clean grid.
const TILT_DEG = 54; // rotateX: cards lie back like on a table at rest
const FAN_DEG = 4.5; // rotateZ per column-step away from centre
const GATHER_PCT = 58; // translateX (% of own width) pulling cards toward centre
const RISE_VH = '34vh'; // translateY: how far below centre the pile starts (peeks at bottom)
const STAGGER = 0.18; // outer cards begin settling after inner ones
const WINDOW = 0.6; // scroll fraction each card animates over

/**
 * One work card. It owns its slice of the scroll: a per-index window maps the
 * shared progress into a local 0→1 that drives the card from a tilted,
 * gathered, sunken state into its resting grid slot. Only transform/opacity
 * animate, so the whole row stays on the compositor.
 */
export function GalleryCard({ item, index, total, progress, reduced }: GalleryCardProps) {
  const mid = (total - 1) / 2;
  const offset = index - mid; // <0 left of centre, >0 right
  const dist = mid === 0 ? 0 : Math.abs(offset) / mid; // 0 centre … 1 outermost

  const start = 0.04 + dist * STAGGER;
  const end = Math.min(start + WINDOW, 1);
  const local = useTransform(progress, [start, end], [0, 1], { clamp: true });

  const y = useTransform(local, [0, 1], [RISE_VH, '0vh']);
  const x = useTransform(local, [0, 1], [`${-offset * GATHER_PCT}%`, '0%']);
  const rotateX = useTransform(local, [0, 1], [TILT_DEG, 0]);
  const rotate = useTransform(local, [0, 1], [offset * FAN_DEG, 0]);
  const scale = useTransform(local, [0, 1], [0.74, 1]);
  const opacity = useTransform(local, [0, 0.35], [0.5, 1]);

  // Hooks run unconditionally; the scroll style is only applied when motion is on.
  const motionStyle = reduced
    ? undefined
    : { y, x, rotateX, rotate, scale, opacity, transformPerspective: 1400 };

  return (
    <motion.article
      style={motionStyle}
      variants={reduced ? fadeUp : undefined}
      initial={reduced ? 'hidden' : undefined}
      whileInView={reduced ? 'visible' : undefined}
      viewport={reduced ? inView : undefined}
      className="group relative overflow-hidden rounded-xl bg-cream-50 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-shadow duration-500 will-change-transform hover:shadow-[0_28px_56px_-24px_rgba(0,0,0,0.7)]"
    >
      <div className="aspect-[3/2] w-full overflow-hidden sm:aspect-[4/3]">
        <GalleryMediaSurface item={item} />
      </div>

      {/* Hover reveal — category + title slide up over a fade scrim. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <p className="translate-y-3 font-mono text-[10px] uppercase tracking-[0.22em] text-cream-100/80 transition-transform duration-500 group-hover:translate-y-0">
          {item.category}
        </p>
        <h3 className="translate-y-3 font-display text-base font-medium text-cream-50 transition-transform duration-500 group-hover:translate-y-0">
          {item.title}
        </h3>
      </div>
    </motion.article>
  );
}

/** Renders the card's media, choosing img / video / themed placeholder. */
function GalleryMediaSurface({ item }: { item: GalleryItem }) {
  const { media } = item;

  if (media.kind === 'image') {
    return (
      <img
        src={media.src}
        alt={media.alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    );
  }

  if (media.kind === 'video') {
    return <VideoSurface src={media.src} poster={media.poster} />;
  }

  return <PlaceholderSurface hue={item.hue} category={item.category} />;
}

/** Muted, looping clip that only plays while hovered (saves battery/data). */
function VideoSurface({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      onMouseEnter={() => {
        void ref.current?.play().catch(() => {});
      }}
      onMouseLeave={() => ref.current?.pause()}
      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
  );
}

/** A themed browser-window mockup used until a real asset is supplied. */
function PlaceholderSurface({ hue, category }: { hue: number; category: string }) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 68% 90%), hsl(${hue + 28} 52% 74%))`,
      }}
    >
      {/* browser chrome */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-3 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-950/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink-950/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink-950/20" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-950/30">
          {category}
        </span>
      </div>

      {/* corner sheen for a little depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/30 opacity-60" />
    </div>
  );
}
