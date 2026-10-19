import { Marquee } from './Marquee';
import { PARTNERS_PRIMARY, PARTNERS_SECONDARY } from '@/data/content';

/**
 * Infinite marquee band + stat row. Two rows scroll in opposite directions;
 * edges fade via a mask so cards dissolve rather than clip.
 */
export function InfiniteScroll() {
  return (
    <div className="relative space-y-8 py-8 sm:space-y-12 sm:py-12">
      <div className="text-center">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-ink-900/40">
          Trusted by engineering teams at
        </h2>
      </div>

      <div
        className="space-y-6"
        style={{
          maskImage:
            'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        }}
      >
        <Marquee items={PARTNERS_PRIMARY} duration={40} />
        <Marquee items={PARTNERS_SECONDARY} duration={50} reverse />
      </div>

    </div>
  );
}
