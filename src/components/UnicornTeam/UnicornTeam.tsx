import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ScrollRevealText } from '@/components/ui/ScrollRevealText';

const TEAM_IMAGES = [
  '/images/team/4.png',
  '/images/team/5.png',
  '/images/team/6.png',
  '/images/team/7.png',
  '/images/team/8.png',
  '/images/team/9.png',
];

export function UnicornTeam() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track the scroll of the entire section to drive the logo orange background fill.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'end 15%'], // stretch the fill over a long scroll distance
  });

  // Spring-smooth the raw scroll so the fill glides and settles instead of
  // tracking every Lenis delta 1:1 (which reads as steppy/jittery).
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26, restDelta: 0.0004 });

  // Delayed but complete: the team photos read normally first, then the logo
  // orange epicenter blooms softly. Scale peaks at 4.5.
  const circleScale = useTransform(smooth, [0.38, 0.75], [0, 4.5]);
  const circleOpacity = useTransform(smooth, [0.35, 0.65], [0, 1]);

  return (
    <div ref={sectionRef} className="relative py-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 sm:gap-12 lg:flex-row lg:gap-24">
        
        {/* Left: Text Content */}
        <div className="flex-1">
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-900/40">
            About Kapidhwaj
          </p>
          <ScrollRevealText
            as="h2"
            className="font-display text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-4xl md:text-5xl lg:text-[4.25rem] lg:leading-[1.08]"
            segments={[
              { text: 'Beyond Code.' },
              { text: 'Beyond Conventional.', break: true },
            ]}
          />
          <div className="mt-6 max-w-xl space-y-4 text-[0.95rem] leading-relaxed text-ink-900/70 sm:mt-8 sm:text-base sm:leading-relaxed">
            <p>
              Kapidhwaj Innovations is a technology and engineering company born from the legacy of Guru Om Services. Building on an established foundation in the metal and scrap industries, we are carrying that entrepreneurial legacy forward into the world of software, technology, and digital innovation.
            </p>
            <p>
              What began with building businesses through trust, relationships, and a deep understanding of industry now evolves into a new chapter - helping businesses embrace technology, solve complex challenges, and unlock new opportunities for growth.
            </p>
             <p>
              At Kapidhwaj Innovations, we bring this legacy forward through strategic thinking, purposeful engineering, and digital solutions designed to create lasting value.
            </p>
          </div>
        </div>

        {/* Right: The Grid of People */}
        <div className="w-full max-w-2xl flex-1">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {TEAM_IMAGES.map((src, i) => (
              <TeamCard
                key={i}
                index={i}
                src={src}
                circleScale={circleScale}
                circleOpacity={circleOpacity}
                reduced={reduced}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

interface TeamCardProps {
  index: number;
  src: string;
  circleScale: MotionValue<number>;
  circleOpacity: MotionValue<number>;
  reduced: boolean;
}

function TeamCard({ index, src, circleScale, circleOpacity, reduced }: TeamCardProps) {
  // Grid is 3 columns x 2 rows
  const col = index % 3;
  const row = Math.floor(index / 3);

  // Epicenter is the 5th image (index 4) -> col 1, row 1
  const epiCol = 1;
  const epiRow = 1;

  // We calculate the exact offset from THIS card's top-left to the global epicenter.
  const gapPx = 16; // md:gap-4 is 1rem = 16px.
  const leftOffset = `calc(${(epiCol - col + 0.5) * 100}% + ${(epiCol - col) * gapPx}px)`;
  const topOffset = `calc(${(epiRow - row + 0.5) * 100}% + ${(epiRow - row) * gapPx}px)`;

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
      {/*
        The shared logo orange fill (#FCBA5D). Every card renders its own copy positioned so
        they align to one epicenter (the 5th image, col=1/row=1), so together
        they read as a single circle blooming across the grid. A soft radial
        edge (feathered 64%→80%) replaces a hard circle boundary so the sweep
        reads as a smooth wash; the solid core still fully covers each card at
        peak scale. Skipped entirely under reduced motion.
      */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="absolute rounded-full will-change-transform"
          style={{
  width: '500px',
  height: '500px',
  left: leftOffset,
  top: topOffset,
  x: '-50%',
  y: '-50%',
  scale: circleScale,
  opacity: circleOpacity,
  backgroundColor: '#e9632c',
}}
        />
      )}

      {/* 
        The Person Image. 
        (Requires true transparent PNGs to look correct without a blend mode).
      */}
      <div className="relative z-10 h-full w-full overflow-hidden">
        <motion.img
          src={src}
          alt={`Team member ${index + 1}`}
          className="h-full w-full object-cover object-top will-change-transform"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
