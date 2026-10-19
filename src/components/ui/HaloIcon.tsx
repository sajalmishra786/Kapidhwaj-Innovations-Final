import type { IconType } from 'react-icons';
import { cn } from '@/lib/cn';

/** Diameters of the halo rings, in % of the stage's smaller side. */
const HALO_SIZES = [62, 81, 100] as const;

interface HaloIconProps {
  Icon: IconType;
  className?: string;
}

/**
 * An icon tile on concentric halos — the centrepiece of the glass preview cards.
 * It fills whatever height its flex parent leaves it, so it also takes up the
 * middle of a card that grows on tall displays instead of leaving it empty.
 *
 * Everything is positioned from the stage's own centre and sized in container
 * units (cqmin) of its smaller side, so the rings are always whole circles that
 * fit the stage. Fixed rem sizes cropped into brackets on short panels, and
 * halos sharing a grid cell sized the track to the widest ring and pushed the
 * icon out of view.
 */
export function HaloIcon({ Icon, className }: HaloIconProps) {
  return (
    <div aria-hidden className={cn('relative min-h-0 flex-1 overflow-hidden [container-type:size]', className)}>
      {HALO_SIZES.map((size, ring) => (
        <span
          key={size}
          className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
          style={{ width: `${size}cqmin`, opacity: 0.95 - ring * 0.27 }}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 flex h-[min(4.5rem,40cqmin)] w-[min(4.5rem,40cqmin)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.4rem] bg-white/85 text-[min(1.9rem,18cqmin)] text-ink-950 shadow-[0_14px_30px_-14px_rgba(23,21,15,0.5)]">
        <Icon />
      </span>
    </div>
  );
}
