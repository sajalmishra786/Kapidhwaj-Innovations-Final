import { useState } from 'react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/data/navigation';
import { useSectionTracker } from '@/hooks/useSectionTracker';
import { spring } from '@/animations/motionVariants';
import { cn } from '@/lib/cn';

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export function Navbar() {
  const active = useSectionTracker(SECTION_IDS);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleNavigate = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <motion.ul
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.4 }}
        className="pointer-events-auto flex items-center gap-1 rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] bg-white/80 backdrop-blur-2xl border border-white/60 sm:gap-2"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const isHovered = hovered === item.id;

          return (
            <li key={item.id} className="relative">
              <a
                href={`#${item.id}`}
                onClick={handleNavigate(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium outline-none transition-colors duration-300 sm:px-5',
                  isActive ? 'text-cream-50' : 'text-ink-700/50 hover:text-ink-900',
                )}
              >
                {/* Morphing active pill (liquid glass) */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={spring}
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[#3A3527] shadow-[0_4px_16px_rgba(58,53,39,0.3)] ring-1 ring-white/10"
                  />
                )}
                
                {/* Hover glow for inactive */}
                {isHovered && !isActive && (
                  <motion.span
                    layoutId="nav-hover"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-ink-900/5"
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <span className="hidden sm:inline-block">{item.label}</span>
                  {isActive ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, width: 0 }}
                      animate={{ opacity: 1, scale: 1, width: 'auto' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Icon className="text-base" aria-hidden />
                    </motion.span>
                  ) : (
                    <Icon className="text-base sm:hidden" aria-hidden />
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </motion.ul>
    </nav>
  );
}
