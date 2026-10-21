
import { cn } from '@/lib/cn';
import type { Partner } from '@/data/content';

interface MarqueeProps {
  items: Partner[];
  duration?: number;
  reverse?: boolean;
}

export function Marquee({
  items,
  duration = 32,
  reverse = false,
}: MarqueeProps) {
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
          reverse
            ? 'animate-[marquee-rev_linear_infinite]'
            : 'animate-[marquee_linear_infinite]',
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-6 pr-6"
          >
            {items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex h-20 shrink-0 items-center justify-center rounded-2xl border border-ink-900/15 bg-white/50 px-8 py-5 shadow-sm transition-colors hover:border-ink-900/25 hover:bg-white/80"
              >
                <img
                  src={item.logo}
                  alt={copy === 0 ? `${item.name} logo` : ''}
                  loading="lazy"
                  className="h-10 w-32 object-contain"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
