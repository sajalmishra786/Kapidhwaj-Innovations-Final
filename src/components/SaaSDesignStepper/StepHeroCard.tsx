import type { IconType } from 'react-icons';

const INK = '#17150F';
const CREAM = '#FFE8DC';
const SUN = '#FFC72C';

interface StepTheme {
  bg: string;
  fg: string;
  tag: string;
  subtitle: string;
}

const STEP_THEMES: Record<string, StepTheme> = {
  '01': {
    bg: SUN,
    fg: INK,
    tag: 'PHASE 01 / DISCOVERY',
    subtitle: 'Requirements, scope & targets',
  },
  '02': {
    bg: '#5A45E0',
    fg: '#F4F1FF',
    tag: 'PHASE 02 / DESIGN',
    subtitle: 'Architecture & interactive UX',
  },
  '03': {
    bg: '#F2622A',
    fg: '#FFF3EC',
    tag: 'PHASE 03 / BUILD',
    subtitle: 'Full-cycle production builds',
  },
  '04': {
    bg: '#1F9D6E',
    fg: '#F0FFF8',
    tag: 'PHASE 04 / DEPLOY',
    subtitle: 'Audited & production ready',
  },
  '05': {
    bg: '#CBD6FF',
    fg: INK,
    tag: 'PHASE 05 / EVOLVE',
    subtitle: 'Proactive support & scale',
  },
};

/** Step 01: Discover & Define — Radar scope & discovery target */
function Step01Art() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Target scope radar rings */}
      <circle cx="120" cy="70" r="54" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="3 5" opacity="0.35" />
      <circle cx="120" cy="70" r="34" fill="none" stroke={INK} strokeWidth="2" opacity="0.55" />
      <circle cx="120" cy="70" r="14" fill={INK} opacity="0.12" />
      <circle cx="120" cy="70" r="5" fill={INK} />

      {/* Crosshair lines */}
      <line x1="56" y1="70" x2="184" y2="70" stroke={INK} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
      <line x1="120" y1="14" x2="120" y2="126" stroke={INK} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />

      {/* Discovery badges */}
      <rect x="28" y="24" width="64" height="20" rx="10" fill={INK} />
      <rect x="38" y="32" width="44" height="4" rx="2" fill="#FFFFFF" />

      <rect x="148" y="24" width="64" height="20" rx="10" fill="#FFFFFF" />
      <rect x="158" y="32" width="44" height="4" rx="2" fill={INK} />

      <rect x="28" y="96" width="68" height="20" rx="10" fill="#FFFFFF" />
      <rect x="38" y="104" width="48" height="4" rx="2" fill="#3E5BFF" />

      <rect x="148" y="96" width="64" height="20" rx="10" fill={INK} />
      <rect x="158" y="104" width="44" height="4" rx="2" fill={SUN} />
    </svg>
  );
}

/** Step 02: Strategize & Design — Wireframes, bezier paths & design tokens */
function Step02Art() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* UI canvas frame */}
      <rect x="24" y="14" width="192" height="112" rx="10" fill="#FFFFFF" opacity="0.15" />
      <rect x="34" y="24" width="70" height="12" rx="4" fill="#FFFFFF" opacity="0.85" />
      <rect x="110" y="24" width="30" height="12" rx="4" fill={CREAM} opacity="0.5" />
      <rect x="146" y="24" width="30" height="12" rx="4" fill={CREAM} opacity="0.5" />

      {/* Layout cards */}
      <rect x="34" y="44" width="56" height="46" rx="8" fill="#FFFFFF" opacity="0.9" />
      <rect x="98" y="44" width="108" height="46" rx="8" fill={CREAM} opacity="0.25" />

      {/* Pen tool vector path */}
      <path d="M34 105 C 70 82, 110 118, 156 94 S 192 108, 206 96" fill="none" stroke={SUN} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="70" cy="94" r="4" fill={SUN} />
      <circle cx="156" cy="94" r="5" fill="#FFFFFF" stroke={SUN} strokeWidth="2.5" />

      {/* Design token swatches */}
      <circle cx="44" cy="112" r="5" fill={SUN} />
      <circle cx="58" cy="112" r="5" fill="#FF7A59" />
      <circle cx="72" cy="112" r="5" fill="#FFFFFF" />
    </svg>
  );
}

/** Step 03: Engineer & Build — Terminal, git graph & code modules */
function Step03Art() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Terminal window */}
      <rect x="22" y="14" width="196" height="112" rx="10" fill={INK} />
      <rect x="22" y="14" width="196" height="20" rx="10" fill="#2E241E" />
      <circle cx="34" cy="24" r="3" fill="#FF5F56" />
      <circle cx="44" cy="24" r="3" fill="#FFBD2E" />
      <circle cx="54" cy="24" r="3" fill="#27C93F" />

      {/* Command prompt line */}
      <rect x="34" y="42" width="72" height="6" rx="3" fill="#27C93F" />
      <rect x="112" y="42" width="58" height="6" rx="3" fill={CREAM} opacity="0.75" />

      {/* Git branch line */}
      <path d="M38 62 v38 M38 74 c12 0 24 -8 36 -8 h42" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="38" cy="62" r="4" fill="#27C93F" />
      <circle cx="38" cy="80" r="3.5" fill={CREAM} />
      <circle cx="38" cy="100" r="4" fill={SUN} />
      <circle cx="74" cy="66" r="3.5" fill={CREAM} />
      <circle cx="116" cy="66" r="4" fill="#27C93F" />

      {/* Test pass badge */}
      <rect x="88" y="86" width="118" height="24" rx="12" fill="#27C93F" />
      <circle cx="100" cy="98" r="4" fill="#FFFFFF" />
      <rect x="110" y="95" width="84" height="6" rx="3" fill="#FFFFFF" />
    </svg>
  );
}

/** Step 04: Validate & Deploy — Speed gauge, checklist & cloud launch */
function Step04Art() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Gauge arc (100% audit) */}
      <circle cx="68" cy="70" r="38" fill="none" stroke="#0F6B49" strokeWidth="10" strokeDasharray="160 80" strokeLinecap="round" transform="rotate(-135 68 70)" />
      <circle cx="68" cy="70" r="38" fill="none" stroke="#ADE87A" strokeWidth="10" strokeDasharray="125 125" strokeLinecap="round" transform="rotate(-135 68 70)" />
      <circle cx="68" cy="70" r="6" fill="#F0FFF8" />
      <line x1="68" y1="70" x2="92" y2="52" stroke="#F0FFF8" strokeWidth="3" strokeLinecap="round" />

      {/* Checklist items */}
      <g transform="translate(122, 28)">
        <rect x="0" y="0" width="96" height="22" rx="11" fill="#F0FFF8" />
        <circle cx="12" cy="11" r="4" fill="#1F9D6E" />
        <rect x="22" y="8" width="62" height="6" rx="3" fill="#0F6B49" />

        <rect x="0" y="30" width="96" height="22" rx="11" fill="#0F6B49" />
        <circle cx="12" cy="41" r="4" fill="#ADE87A" />
        <rect x="22" y="38" width="62" height="6" rx="3" fill="#F0FFF8" />

        <rect x="0" y="60" width="96" height="22" rx="11" fill="#F0FFF8" />
        <circle cx="12" cy="71" r="4" fill="#1F9D6E" />
        <rect x="22" y="68" width="62" height="6" rx="3" fill="#0F6B49" />
      </g>
    </svg>
  );
}

/** Step 05: Support & Evolve — Live telemetry, uptime & compounding curve */
function Step05Art() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Grid lines */}
      {[32, 68, 104].map((y) => (
        <line key={y} x1="20" x2="220" y1={y} y2={y} stroke={INK} strokeWidth="1.2" opacity="0.12" />
      ))}

      {/* Heartbeat pulse wave */}
      <path
        d="M20 74 h38 l8 -18 l8 28 l10 -34 l8 24 h30 l10 -22 l10 30 l8 -18 h42"
        fill="none"
        stroke="#3E5BFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Compounding upward curve */}
      <path
        d="M20 114 C 70 110, 120 90, 165 52 S 200 32, 218 24"
        fill="none"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="165" cy="52" r="5" fill={SUN} stroke={INK} strokeWidth="2" />

      {/* 99.9% health badge */}
      <rect x="118" y="94" width="102" height="22" rx="11" fill="#FFFFFF" />
      <circle cx="128" cy="105" r="3.5" fill="#2FA57A" />
      <rect x="136" y="102" width="74" height="6" rx="3" fill={INK} opacity="0.8" />
    </svg>
  );
}

const ART_MAP: Record<string, () => React.JSX.Element> = {
  '01': Step01Art,
  '02': Step02Art,
  '03': Step03Art,
  '04': Step04Art,
  '05': Step05Art,
};

interface StepHeroCardProps {
  id: string;
  title: string;
  Icon?: IconType;
}

/**
 * Hero-style poster card for each process step in the development process section.
 * Clean, non-overlapping flex layout with dedicated header, art stage, and footer.
 */
export function StepHeroCard({ id, title }: StepHeroCardProps) {
  const theme = STEP_THEMES[id] || STEP_THEMES['01'];
  const Art = ART_MAP[id] || Step01Art;

  return (
    <div className="relative h-full w-full">
      {/* Main Poster Card */}
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-[0_24px_48px_-20px_rgba(23,21,15,0.42),0_4px_12px_rgba(23,21,15,0.1)] ring-1 ring-black/10 xl:p-6"
        style={{ backgroundColor: theme.bg, color: theme.fg }}
      >
        {/* Gloss Sheen Overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
        />

        {/* Top Header Row */}
        <div className="relative z-10 flex shrink-0 items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] opacity-85">
            {theme.tag}
          </span>
          <span className="rounded-full bg-black/15 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider backdrop-blur-sm">
            / {id}
          </span>
        </div>

        {/* Center Art Stage (strictly isolated flex-1, cannot touch header or footer) */}
        <div className="relative my-auto flex flex-1 min-h-0 items-center justify-center py-2">
          <Art />
        </div>

        {/* Bottom Title & Subtitle Row (strictly isolated, cannot touch art) */}
        <div className="relative z-10 shrink-0 pt-2">
          <h4 className="font-display text-lg font-bold leading-tight tracking-tight sm:text-xl">
            {title}
          </h4>
          <p className="mt-0.5 text-xs font-medium leading-snug opacity-80 sm:text-[13px]">
            {theme.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
