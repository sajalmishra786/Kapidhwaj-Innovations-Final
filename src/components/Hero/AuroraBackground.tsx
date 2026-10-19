import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Animated mesh-gradient aurora with mouse-parallax depth layers.
 * Pure transform/opacity. Parallax is disabled under reduced motion.
 */
export function AuroraBackground({ dark = false }: { dark?: boolean }) {
  const reduced = useReducedMotion();
  const px = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (event: MouseEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      px.set(nx);
      py.set(ny);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced, px, py]);

  const blobOneX = useTransform(px, [-0.5, 0.5], [-40, 40]);
  const blobOneY = useTransform(py, [-0.5, 0.5], [-30, 30]);
  const blobTwoX = useTransform(px, [-0.5, 0.5], [30, -30]);
  const blobTwoY = useTransform(py, [-0.5, 0.5], [25, -25]);

  return (
    <div className="grain pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft, low-opacity color wash — minimal on cream */}
      <motion.div
        style={{ x: blobOneX, y: blobOneY }}
        className="absolute -left-[10%] top-[-20%] h-[55vw] w-[55vw] rounded-full bg-accent-violet/[0.10] blur-[130px] will-change-transform animate-aurora-drift"
      />
      <motion.div
        style={{ x: blobTwoX, y: blobTwoY }}
        className="absolute -right-[5%] top-[10%] h-[45vw] w-[45vw] rounded-full bg-accent-cyan/[0.10] blur-[130px] will-change-transform animate-aurora-drift [animation-delay:-6s]"
      />
      <div className="absolute bottom-[-15%] left-1/3 h-[40vw] w-[40vw] rounded-full bg-accent-ember/[0.07] blur-[150px] animate-aurora-drift [animation-delay:-12s]" />

      {/* fine grid overlay */}
      <div
        aria-hidden
        className={`absolute inset-0 opacity-[0.05] ${dark ? 'opacity-[0.1]' : ''}`}
        style={{
          backgroundImage: dark
            ? 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)'
            : 'linear-gradient(rgba(23,21,15,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(23,21,15,0.7) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 100%)',
        }}
      />
      {/* vignette */}
      <div className={`absolute inset-0 bg-gradient-to-b ${dark ? 'from-ink-950/0 via-ink-950/0 to-ink-950' : 'from-cream-100/0 via-cream-100/0 to-cream-100'}`} />
    </div>
  );
}
