import type { Variants, Transition } from 'framer-motion';

/** Shared spring — the signature "premium" feel across the site. */
export const spring: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
};

export const easeOutExpo: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
};

/** Fade + rise — default entrance for blocks entering the viewport. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOutExpo,
  },
};

/** Stagger container for lists/grids. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

/** Per-word reveal used by AnimatedText. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: '0.6em', rotateX: -40 },
  visible: {
    opacity: 1,
    y: '0em',
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: easeOutExpo },
};

/** Standard viewport trigger config — fires once, early. */
export const inView = {
  once: true,
  amount: 0.1,
  margin: '0px',
} as const;
