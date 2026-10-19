import { cn } from '@/lib/cn';
import type { Partner } from '@/data/content';

interface MarqueeProps {
  items: Partner[];
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
}

/**
 * Seamless infinite marquee. A single track holds two identical copies and
 * translates by exactly -50%, so the loop point is invisible.
 * On hover, the animation is gracefully paused via CSS.
 */
export function Marquee({ items, duration = 32, reverse = false }: MarqueeProps) {
  return (
    <div
      className="group relative flex overflow-hidden"
      role="list"
      aria-label="Trusted partners and customers"
    >
      <div
        className={cn(
          'flex w-max shrink-0 will-change-transform motion-reduce:animate-none',
          'group-hover:[animation-play-state:paused]',
          reverse ? 'animate-[marquee-rev_linear_infinite]' : 'animate-[marquee_linear_infinite]',
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-6 pr-6"
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <li
                  key={`${item.name}-${i}`}
                  className="glass group flex items-center gap-4 whitespace-nowrap rounded-2xl px-8 py-5 text-ink-900 transition-colors hover:bg-white/80 cursor-pointer"
                >
                  <Icon className="h-6 w-6 text-ink-900/80 transition-colors group-hover:text-ink-900" />
                  <span className="font-display text-lg font-medium tracking-tight">
                    {item.name}
                  </span>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
