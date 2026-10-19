import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * Light / minimal cream theme. Design tokens live here AND mirror into CSS
 * custom properties in index.css. Tailwind reads these for utility generation;
 * runtime/JS animation reads the CSS vars. Keep the two in sync.
 *
 * - `cream`  → page surfaces (the background scale)
 * - `ink`    → warm near-black text + subtle dark tints
 * - `accent` → deep, saturated tones chosen to read on cream
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFFFF',
          100: '#FAF8F2',
          200: '#F2EFE6',
          300: '#E8E3D6',
        },
        ink: {
          950: '#17150F',
          900: '#211E16',
          850: '#2B271C',
          800: '#3A3527',
          700: '#5C5544',
        },
        // The page surface of the dark chapter, from the "growth" hand-off to the footer.
        night: '#1A1714',
        accent: {
          cyan: '#0E8C92',
          violet: '#5A45E0',
          ember: '#DB5A0E',
          coral: '#E0795E',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(2.75rem, 1rem + 8vw, 8.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        display: ['clamp(2rem, 1rem + 4vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
      },
      spacing: {
        section: 'clamp(3rem, 2rem + 4vw, 7rem)',
      },
      borderRadius: {
        glass: '1.75rem',
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 10px 36px -16px rgba(23,21,15,0.22), inset 0 1px 0 0 rgba(255,255,255,0.75)',
        glow: '0 0 30px -6px rgba(14,140,146,0.35)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(-5%, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(5%, -3%, 0) rotate(8deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'flag-wave': {
          '0%, 100%': { transform: 'skewY(0deg) scaleX(1)' },
          '50%': { transform: 'skewY(-7deg) scaleX(0.9)' },
        },
      },
      animation: {
        'aurora-drift': 'aurora-drift 18s ease-in-out infinite',
        'flag-wave': 'flag-wave 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // `short:` — low-height viewports (small laptops, landscape phones/tablets).
    // Pinned sections use it to tighten their chrome so content still fits.
    //
    // This is a variant rather than a `screens` entry on purpose: Tailwind only
    // generates the `max-sm:` / `max-lg:` width variants while every screen is a
    // plain min-width one, so a raw `(max-height)` screen silently removes them.
    plugin(({ addVariant }) => {
      addVariant('short', '@media (max-height: 720px)');
    }),
  ],
} satisfies Config;
