import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { useReducedMotion } from './useReducedMotion';

/**
 * Initializes Lenis smooth scroll, driven by requestAnimationFrame.
 * Disabled entirely under prefers-reduced-motion so native scroll takes over.
 * Exposes the instance on window for anchor navigation (BottomNavbar).
 */
export function useLenis(): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [reduced]);
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}
