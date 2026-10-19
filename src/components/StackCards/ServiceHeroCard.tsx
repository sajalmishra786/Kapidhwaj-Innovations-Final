import type { ServiceCard } from '@/data/content';

const INK = '#17150F';
const CREAM = '#FFE8DC';
const SUN = '#FFC72C';

interface ServiceTheme {
  bg: string;
  fg: string;
  tag: string;
  subtitle: string;
}

const SERVICE_THEMES: Record<string, ServiceTheme> = {
  '01': {
    bg: '#D8392B',
    fg: '#FFF3EC',
    tag: 'ENTERPRISE CORE',
    subtitle: 'Streamlined workflows & visibility',
  },
  '02': {
    bg: '#CBD6FF',
    fg: INK,
    tag: 'SAAS ENGINEERING',
    subtitle: 'Full-cycle scalable architecture',
  },
  '03': {
    bg: SUN,
    fg: INK,
    tag: 'WEB ARCHITECTURES',
    subtitle: 'High-conversion digital ecosystems',
  },
  '04': {
    bg: '#FF9C86',
    fg: INK,
    tag: 'AI & AUTOMATION',
    subtitle: 'Cognitive systems & LLM loops',
  },
  '05': {
    bg: '#5A45E0',
    fg: '#F4F1FF',
    tag: 'MARKET INTELLIGENCE',
    subtitle: 'Data-driven competitive foresight',
  },
  '06': {
    bg: '#1F9D6E',
    fg: '#F0FFF8',
    tag: 'CLOUD RESILIENCE',
    subtitle: 'Enterprise infrastructure & security',
  },
};

/** Service 01: ERP & Enterprise Management Solutions */
function ErpArt() {
  const bars = [
    { x: 108, h: 32 },
    { x: 126, h: 50 },
    { x: 144, h: 40 },
    { x: 162, h: 66, peak: true },
    { x: 180, h: 54 },
    { x: 198, h: 36 },
  ];

  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Donut chart */}
      <circle cx="54" cy="70" r="28" fill="none" stroke={CREAM} strokeWidth="12" strokeDasharray="110 50" strokeLinecap="round" transform="rotate(-70 54 70)" />
      <circle cx="54" cy="70" r="6" fill={SUN} />

      {/* Top metrics pill */}
      <rect x="108" y="24" width="108" height="16" rx="8" fill={CREAM} opacity="0.9" />
      <rect x="114" y="29" width="48" height="6" rx="3" fill={INK} />

      {/* Workflow bars */}
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={118 - bar.h}
          width="14"
          height={bar.h}
          rx="5"
          fill={bar.peak ? INK : CREAM}
        />
      ))}
      <rect x="104" y="120" width="112" height="3" rx="1.5" fill={CREAM} opacity="0.6" />
    </svg>
  );
}

/** Service 02: Custom Software & SaaS Engineering */
function SaasArt() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Main application window */}
      <rect x="20" y="16" width="200" height="110" rx="12" fill="#FFFFFF" />
      <rect x="20" y="16" width="200" height="22" rx="12" fill="#3E5BFF" />
      <circle cx="32" cy="27" r="3" fill="#FF5F56" />
      <circle cx="42" cy="27" r="3" fill="#FFBD2E" />
      <circle cx="52" cy="27" r="3" fill="#27C93F" />

      {/* Left nav panel */}
      <rect x="28" y="44" width="44" height="74" rx="6" fill="#F0F4FF" />
      <rect x="34" y="52" width="32" height="6" rx="3" fill="#3E5BFF" opacity="0.8" />
      <rect x="34" y="64" width="26" height="5" rx="2.5" fill={INK} opacity="0.25" />
      <rect x="34" y="75" width="28" height="5" rx="2.5" fill={INK} opacity="0.25" />

      {/* Central code component */}
      <rect x="78" y="44" width="76" height="74" rx="6" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="86" y="52" width="60" height="6" rx="3" fill="#3E5BFF" />
      <rect x="86" y="63" width="48" height="5" rx="2.5" fill={INK} opacity="0.2" />
      <rect x="86" y="74" width="54" height="5" rx="2.5" fill="#FF7A59" />
      <rect x="86" y="94" width="60" height="16" rx="5" fill="#3E5BFF" />

      {/* Right metric widget */}
      <rect x="160" y="44" width="52" height="74" rx="6" fill={INK} />
      <path d="M168 98 l10-14 l10 8 l14-18" fill="none" stroke={SUN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="202" cy="74" r="3.5" fill={SUN} />
    </svg>
  );
}

/** Service 03: Bespoke Web Architectures */
function WebArt() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Desktop browser canvas */}
      <rect x="22" y="16" width="138" height="110" rx="10" fill={INK} />
      <rect x="22" y="16" width="138" height="18" rx="10" fill="#2E241E" />
      <circle cx="32" cy="25" r="2.5" fill="#FFFFFF" opacity="0.4" />
      <circle cx="40" cy="25" r="2.5" fill="#FFFFFF" opacity="0.4" />
      <circle cx="48" cy="25" r="2.5" fill="#FFFFFF" opacity="0.4" />

      {/* Desktop content layout */}
      <rect x="32" y="40" width="118" height="26" rx="6" fill="#3E5BFF" />
      <rect x="32" y="72" width="56" height="46" rx="6" fill="#FF7A59" />
      <rect x="94" y="72" width="56" height="46" rx="6" fill="#FFFFFF" opacity="0.9" />

      {/* Overlapping mobile device */}
      <rect x="150" y="24" width="68" height="102" rx="12" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
      <rect x="170" y="28" width="28" height="4" rx="2" fill={INK} opacity="0.25" />
      <rect x="156" y="38" width="56" height="34" rx="6" fill="#3E5BFF" />
      <rect x="156" y="78" width="56" height="6" rx="3" fill={INK} opacity="0.75" />
      <rect x="156" y="88" width="40" height="6" rx="3" fill={INK} opacity="0.3" />
      <rect x="156" y="100" width="56" height="18" rx="5" fill={SUN} />
    </svg>
  );
}

/** Service 04: Intelligent Automation & AI Product Engineering */
function AiArt() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* User query bubble */}
      <rect x="24" y="16" width="124" height="42" rx="12" fill="#FFFFFF" />
      <rect x="36" y="26" width="100" height="7" rx="3.5" fill="#FF9C86" opacity="0.9" />
      <rect x="36" y="38" width="70" height="7" rx="3.5" fill="#FF9C86" opacity="0.5" />

      {/* AI agent response bubble */}
      <rect x="82" y="66" width="134" height="48" rx="14" fill={INK} />
      <rect x="96" y="78" width="92" height="7" rx="3.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="96" y="91" width="106" height="7" rx="3.5" fill="#FFFFFF" opacity="0.5" />

      {/* Typing indicator pill */}
      <rect x="24" y="74" width="48" height="24" rx="12" fill="#FFFFFF" />
      <circle cx="36" cy="86" r="3" fill="#FF9C86" />
      <circle cx="48" cy="86" r="3" fill="#FF9C86" />
      <circle cx="60" cy="86" r="3" fill="#FF9C86" />

      {/* AI Sparkle */}
      <path d="M192 18 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" fill="#FFF7D6" />
    </svg>
  );
}

/** Service 05: Strategic Growth & Market Intelligence */
function AnalyticsArt() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Horizontal guide lines */}
      {[36, 68, 100].map((y) => (
        <line key={y} x1="20" x2="220" y1={y} y2={y} stroke="#FFFFFF" strokeWidth="1.2" opacity="0.18" />
      ))}

      {/* Area under curve */}
      <path d="M24 116 C 60 110, 95 86, 130 64 S 185 36, 216 26 L216 122 L24 122 Z" fill="#FFFFFF" opacity="0.12" />

      {/* Rising trend curve */}
      <path d="M24 116 C 60 110, 95 86, 130 64 S 185 36, 216 26" fill="none" stroke={CREAM} strokeWidth="4" strokeLinecap="round" />

      {/* Peak dot */}
      <circle cx="216" cy="26" r="6" fill={SUN} stroke="#FFFFFF" strokeWidth="2.5" />

      {/* KPI highlight card */}
      <rect x="110" y="30" width="76" height="24" rx="12" fill="#FFFFFF" />
      <circle cx="122" cy="42" r="4" fill="#2FA57A" />
      <rect x="132" y="38" width="44" height="8" rx="4" fill="#5A45E0" />
    </svg>
  );
}

/** Service 06: Enterprise Cloud Infrastructure & Resilience */
function CloudArt() {
  return (
    <svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet" aria-hidden className="h-full w-full max-h-[170px]">
      {/* Cloud icon */}
      <g fill="#F0FFF8">
        <circle cx="94" cy="38" r="18" />
        <circle cx="120" cy="26" r="22" />
        <circle cx="146" cy="38" r="16" />
        <rect x="76" y="38" width="86" height="18" rx="9" />
      </g>

      {/* Data streams */}
      <g stroke="#F0FFF8" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" opacity="0.75">
        <line x1="102" y1="58" x2="102" y2="68" />
        <line x1="120" y1="58" x2="120" y2="68" />
        <line x1="138" y1="58" x2="138" y2="68" />
      </g>

      {/* Server rack blades */}
      {[72, 92, 112].map((y) => (
        <g key={y}>
          <rect x="36" y={y} width="168" height="16" rx="6" fill="#0F6B49" />
          <circle cx="48" cy={y + 8} r="2.8" fill="#ADE87A" />
          <circle cx="58" cy={y + 8} r="2.8" fill="#ADE87A" opacity="0.5" />
          <rect x="136" y={y + 5} width="60" height="6" rx="3" fill="#F0FFF8" opacity="0.35" />
        </g>
      ))}
    </svg>
  );
}

const ART_MAP: Record<string, () => React.JSX.Element> = {
  '01': ErpArt,
  '02': SaasArt,
  '03': WebArt,
  '04': AiArt,
  '05': AnalyticsArt,
  '06': CloudArt,
};

/**
 * Hero-style poster card for each service item.
 * Clean, non-overlapping flex layout with dedicated header, art stage, and footer.
 */
export function ServiceHeroCard({ service }: { service: ServiceCard }) {
  const theme = SERVICE_THEMES[service.index] || SERVICE_THEMES['01'];
  const Art = ART_MAP[service.index] || ErpArt;

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
            / {service.index}
          </span>
        </div>

        {/* Center Art Stage (strictly isolated flex-1, cannot touch header or footer) */}
        <div className="relative my-auto flex flex-1 min-h-0 items-center justify-center py-2">
          <Art />
        </div>

        {/* Bottom Title & Subtitle Row (strictly isolated, cannot touch art) */}
        <div className="relative z-10 shrink-0 pt-2">
          <h4 className="font-display text-lg font-bold leading-tight tracking-tight sm:text-xl">
            {service.name}
          </h4>
          <p className="mt-0.5 text-xs font-medium leading-snug opacity-80 sm:text-[13px]">
            {theme.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
