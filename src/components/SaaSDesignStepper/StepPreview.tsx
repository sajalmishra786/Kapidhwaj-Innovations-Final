import type { IconType } from 'react-icons';
import { StepHeroCard } from './StepHeroCard';

/** The same turbulence the preview always had, baked into an image so it is painted once, not re-filtered on every step. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface StepPreviewProps {
  id: string;
  title: string;
  Icon: IconType;
}

/** Premium poster preview — reflects the active phase with hero-style vector artwork. */
export function StepPreview({ id, title, Icon }: StepPreviewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#EDEBE4] to-[#D7D3C9]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/50 blur-3xl" />

      {/* hero-style poster card */}
      <div className="absolute inset-5 sm:inset-6 flex flex-col">
        <StepHeroCard id={id} title={title} Icon={Icon} />
      </div>
    </div>
  );
}
