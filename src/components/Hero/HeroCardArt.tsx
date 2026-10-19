import type { HeroCardId } from '@/data/content';

/**
 * Artwork for the hero's work cards. Each is a flat, poster-like composition
 * drawn on a 240×264 canvas. The bottom ~56 units are kept clear for the card's
 * title, and the heaviest motifs sit left of centre because every card but the
 * last is partly covered by its right-hand neighbour.
 *
 * Palettes are artwork, not UI tokens, so they live here rather than in the
 * Tailwind theme.
 */

interface CardTheme {
  /** Card background. */
  bg: string;
  /** Label and title colour — chosen for contrast against `bg`. */
  fg: string;
}

const INK = '#17150F';
const CREAM = '#FFE8DC';
const SUN = '#FFC72C';

export const CARD_THEME: Record<HeroCardId, CardTheme> = {
  erp: { bg: '#D8392B', fg: '#FFF3EC' },
  marketplace: { bg: '#CBD6FF', fg: INK },
  auction: { bg: SUN, fg: INK },
  ai: { bg: '#FF9C86', fg: INK },
  talent: { bg: '#F2622A', fg: '#FFF3EC' },
  analytics: { bg: '#5A45E0', fg: '#F4F1FF' },
  cloud: { bg: '#1F9D6E', fg: '#F0FFF8' },
};

/** Stacked bars and a donut — the back-office dashboard. */
function ErpArt() {
  const bars = [
    { x: 22, h: 52 },
    { x: 54, h: 84 },
    { x: 86, h: 64 },
    { x: 118, h: 116 },
    { x: 150, h: 92 },
    { x: 182, h: 70 },
  ];

  return (
    <>
      <circle cx="58" cy="58" r="22" fill="none" stroke={CREAM} strokeWidth="11" strokeDasharray="88 50" strokeLinecap="round" transform="rotate(-70 58 58)" />
      <circle cx="58" cy="58" r="5" fill={SUN} />
      <rect x="112" y="38" width="94" height="12" rx="6" fill={CREAM} opacity="0.9" />
      <rect x="112" y="58" width="62" height="10" rx="5" fill={CREAM} opacity="0.5" />
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={196 - bar.h}
          width="24"
          height={bar.h}
          rx="6"
          fill={bar.h === 116 ? INK : CREAM}
        />
      ))}
      <rect x="22" y="200" width="184" height="3" rx="1.5" fill={CREAM} opacity="0.55" />
    </>
  );
}

/** A grid of product tiles with price tags. */
function MarketplaceArt() {
  return (
    <>
      <rect x="20" y="34" width="98" height="86" rx="14" fill="#3E5BFF" />
      <circle cx="69" cy="70" r="22" fill={SUN} />
      <rect x="34" y="102" width="44" height="10" rx="5" fill="#FFFFFF" opacity="0.85" />
      <rect x="128" y="34" width="92" height="86" rx="14" fill="#FFFFFF" />
      <rect x="146" y="52" width="56" height="42" rx="10" fill="#FF7A59" />
      <rect x="146" y="102" width="30" height="8" rx="4" fill={INK} opacity="0.75" />
      <rect x="20" y="130" width="98" height="68" rx="14" fill="#FFFFFF" />
      <rect x="34" y="146" width="62" height="9" rx="4.5" fill="#3E5BFF" opacity="0.8" />
      <rect x="34" y="162" width="40" height="9" rx="4.5" fill={INK} opacity="0.2" />
      <rect x="34" y="180" width="34" height="12" rx="6" fill={INK} />
      <rect x="128" y="130" width="92" height="68" rx="14" fill={INK} />
      <path d="M146 176l16-18 14 12 18-24 14 14" fill="none" stroke={SUN} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** A gavel beside a rising bid ladder. */
function AuctionArt() {
  return (
    <>
      <g transform="rotate(-30 98 104)">
        <rect x="56" y="58" width="84" height="40" rx="11" fill={INK} />
        <rect x="76" y="58" width="9" height="40" fill={SUN} opacity="0.9" />
        <rect x="111" y="58" width="9" height="40" fill={SUN} opacity="0.9" />
        <rect x="90" y="94" width="16" height="96" rx="8" fill={INK} />
      </g>
      <rect x="22" y="186" width="118" height="16" rx="8" fill={INK} />
      <rect x="150" y="40" width="72" height="22" rx="11" fill={INK} />
      <rect x="150" y="70" width="56" height="22" rx="11" fill={INK} opacity="0.7" />
      <rect x="150" y="100" width="40" height="22" rx="11" fill={INK} opacity="0.4" />
      <path d="M163 56l7-9 7 9" fill="none" stroke={SUN} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** A short chat: question, answer, and a typing indicator. */
function AiArt() {
  return (
    <>
      <path d="M36 38h104a16 16 0 0 1 16 16v26a16 16 0 0 1-16 16H64l-18 14v-14h-10a16 16 0 0 1-16-16V54a16 16 0 0 1 16-16z" fill="#FFFFFF" transform="translate(-4 0)" />
      <rect x="30" y="54" width="92" height="8" rx="4" fill="#FF9C86" opacity="0.8" />
      <rect x="30" y="72" width="60" height="8" rx="4" fill="#FF9C86" opacity="0.5" />
      <rect x="76" y="124" width="140" height="52" rx="16" fill={INK} />
      <rect x="92" y="140" width="76" height="8" rx="4" fill="#FFFFFF" opacity="0.9" />
      <rect x="92" y="156" width="104" height="8" rx="4" fill="#FFFFFF" opacity="0.5" />
      <rect x="22" y="186" width="66" height="26" rx="13" fill="#FFFFFF" />
      {[40, 55, 70].map((cx) => (
        <circle key={cx} cx={cx} cy="199" r="4" fill="#FF9C86" />
      ))}
      <path d="M200 28l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" fill="#FFF7D6" />
    </>
  );
}

function Avatar({ cx, cy, r, bg, fg }: { cx: number; cy: number; r: number; bg: string; fg: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <circle cx={cx} cy={cy - r * 0.2} r={r * 0.34} fill={fg} />
      <path d={`M${cx - r * 0.62} ${cy + r * 0.78}a${r * 0.62} ${r * 0.55} 0 0 1 ${r * 1.24} 0z`} fill={fg} />
    </g>
  );
}

/** A profile ringed by candidates, under a magnifier. */
function TalentArt() {
  return (
    <>
      <circle cx="120" cy="108" r="64" fill="none" stroke={CREAM} strokeWidth="2" strokeDasharray="3 7" opacity="0.7" />
      <Avatar cx={120} cy={42} r={17} bg={INK} fg={CREAM} />
      <Avatar cx={58} cy={76} r={17} bg={SUN} fg={INK} />
      <Avatar cx={58} cy={140} r={17} bg={CREAM} fg="#F2622A" />
      <Avatar cx={120} cy={174} r={17} bg={INK} fg={SUN} />
      <Avatar cx={182} cy={76} r={17} bg={CREAM} fg={INK} />
      <Avatar cx={120} cy={108} r={34} bg={CREAM} fg="#F2622A" />
      <circle cx="158" cy="146" r="24" fill="none" stroke={INK} strokeWidth="7" />
      <path d="M176 164l20 20" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    </>
  );
}

/** A rising line chart with a highlighted data point. */
function AnalyticsArt() {
  return (
    <>
      {[84, 122, 160].map((y) => (
        <line key={y} x1="20" x2="222" y1={y} y2={y} stroke="#FFFFFF" strokeWidth="1.5" opacity="0.18" />
      ))}
      <path d="M20 184C48 166 68 158 94 144S142 112 162 98 202 72 222 54V198H20z" fill="#FFFFFF" opacity="0.14" />
      <path d="M20 184C48 166 68 158 94 144S142 112 162 98 202 72 222 54" fill="none" stroke={CREAM} strokeWidth="5" strokeLinecap="round" />
      <circle cx="94" cy="144" r="5.5" fill={CREAM} />
      <circle cx="162" cy="98" r="9" fill={SUN} stroke="#FFFFFF" strokeWidth="3.5" />
      <rect x="128" y="52" width="68" height="24" rx="12" fill="#FFFFFF" />
      <rect x="140" y="60" width="26" height="8" rx="4" fill="#5A45E0" />
      <rect x="170" y="60" width="14" height="8" rx="4" fill={INK} opacity="0.25" />
    </>
  );
}

/** A cloud above a rack of servers. */
function CloudArt() {
  return (
    <>
      <g fill="#F0FFF8">
        <circle cx="92" cy="86" r="26" />
        <circle cx="126" cy="70" r="32" />
        <circle cx="160" cy="88" r="24" />
        <rect x="68" y="86" width="116" height="28" rx="14" />
      </g>
      <g stroke="#F0FFF8" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" opacity="0.75">
        <line x1="100" x2="100" y1="122" y2="132" />
        <line x1="140" x2="140" y1="122" y2="132" />
      </g>
      {[134, 158, 182].map((y) => (
        <g key={y}>
          <rect x="58" y={y} width="124" height="20" rx="8" fill="#0F6B49" />
          <circle cx="74" cy={y + 10} r="3.5" fill="#ADE87A" />
          <circle cx="86" cy={y + 10} r="3.5" fill="#ADE87A" opacity="0.5" />
          <rect x="120" y={y + 7} width="50" height="6" rx="3" fill="#F0FFF8" opacity="0.35" />
        </g>
      ))}
    </>
  );
}

const ART: Record<HeroCardId, () => React.JSX.Element> = {
  erp: ErpArt,
  marketplace: MarketplaceArt,
  auction: AuctionArt,
  ai: AiArt,
  talent: TalentArt,
  analytics: AnalyticsArt,
  cloud: CloudArt,
};

export function HeroCardArt({ id }: { id: HeroCardId }) {
  const Art = ART[id];

  return (
    <svg
      viewBox="0 0 240 264"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 h-full w-full"
    >
      <Art />
    </svg>
  );
}
