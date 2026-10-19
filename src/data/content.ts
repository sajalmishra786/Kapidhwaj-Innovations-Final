import { FiCpu, FiCode, FiLayout, FiTrendingUp, FiShield, FiGrid } from 'react-icons/fi';
import type { IconType } from 'react-icons';

import {
  SiVercel,
  SiStripe,
  SiGithub,
  SiFigma,
  SiLinear,
  SiRaycast,
  SiNotion,
  SiFramer,
  SiSpotify,
  SiUber,
  SiAirbnb,
  SiOpenai,
} from 'react-icons/si';

/* ── Hero ────────────────────────────────────────────────── */
export const HERO = {
  /** One entry per rendered line on wide screens; words reflow on phones. */
  headline: ['Engineering Ideas.', 'Enabling Growth.'],
  description:
    'We help businesses navigate complexity through strategic technology consulting, custom software engineering, intelligent automation, and resilient digital infrastructure - transforming ambitious ideas into solutions built for real-world impact.',
  /** `target` is a section id from App.tsx. */
  primaryCta: { label: 'Start a project', target: 'contact' },
  secondaryCta: { label: 'Explore services', target: 'stack' },
} as const;

export type HeroCardId =
  | 'erp'
  | 'marketplace'
  | 'auction'
  | 'ai'
  | 'talent'
  | 'analytics'
  | 'cloud';

export interface HeroCard {
  /** Selects the card's artwork and palette in Hero/HeroCardArt.tsx. */
  id: HeroCardId;
  title: string;
  /** Short mono tag in the card's top corner. */
  label: string;
}

/**
 * Left → right order of the fan; the last card sits on top. Phones show only
 * the last five, so keep the strongest cards at the end.
 */
export const HERO_CARDS: HeroCard[] = [
  { id: 'erp', title: 'ERP System', label: 'Enterprise' },
  { id: 'marketplace', title: 'Marketplace', label: 'Commerce' },
  { id: 'auction', title: 'E-Auction', label: 'Auctions' },
  { id: 'ai', title: 'AI Enquiry', label: 'AI & Automation' },
  { id: 'talent', title: 'Talent Discovery', label: 'HR Tech' },
  { id: 'analytics', title: 'Market Insight', label: 'Analytics' },
  { id: 'cloud', title: 'Cloud Platform', label: 'Infrastructure' },
];

export interface HeroBubble {
  text: string;
  tone: 'blue' | 'green';
}

/** Speech bubbles pinned to the fan — first sits on the 2nd card, second on the last. */
export const HERO_BUBBLES: HeroBubble[] = [
  { text: 'Idea to MVP in 6 weeks', tone: 'blue' },
  { text: '99.9% platform uptime', tone: 'green' },
];

/* ── Marquee / infinite scroll ───────────────────────────── */
export interface Partner {
  name: string;
  icon: IconType;
}

export const PARTNERS_PRIMARY: Partner[] = [
  { name: 'Vercel', icon: SiVercel },
  { name: 'Stripe', icon: SiStripe },
  { name: 'GitHub', icon: SiGithub },
  { name: 'Figma', icon: SiFigma },
  { name: 'Linear', icon: SiLinear },
  { name: 'Raycast', icon: SiRaycast },
];

export const PARTNERS_SECONDARY: Partner[] = [
  { name: 'Notion', icon: SiNotion },
  { name: 'Framer', icon: SiFramer },
  { name: 'Spotify', icon: SiSpotify },
  { name: 'Uber', icon: SiUber },
  { name: 'Airbnb', icon: SiAirbnb },
  { name: 'OpenAI', icon: SiOpenai },
];

export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: '50+', label: 'SaaS products shipped' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '6 wks', label: 'Idea to first MVP' },
  { value: '4.9/5', label: 'Client satisfaction' },
];

/* ── Storytelling scenes ─────────────────────────────────── */
export interface Scene {
  eyebrow: string;
  title: string;
  body: string;
}

export const SCENES: Scene[] = [
  {
    eyebrow: 'Phase 01',
    title: 'We start with the impossible.',
    body: 'Every engagement opens with the question nobody else will answer. We pressure-test the ambition until only the signal remains.',
  },
  {
    eyebrow: 'Phase 02',
    title: 'Architecture as a craft.',
    body: 'Systems that scale are designed, not discovered. We model the edges first, then build inward with relentless discipline.',
  },
  {
    eyebrow: 'Phase 03',
    title: 'Interfaces that feel alive.',
    body: 'Motion, depth, and rhythm turn software into something people reach for. The details are the product.',
  },
  {
    eyebrow: 'Phase 04',
    title: 'Ship. Measure. Compound.',
    body: 'We launch fast and instrument everything, turning every release into momentum for the next.',
  },
];

/* ── Service stack cards ─────────────────────────────────── */
export interface ServiceCard {
  index: string;
  /** Punchy verb that anchors the service — Advise, Build, Grow… */
  name: string;
  /** Full descriptive title. */
  title: string;
  description: string;
  /** Three capability tags drawn from the description. */
  chips: string[];
  /** Card background — bright, on-brand pastel. */
  color: string;
  /** Hue for the themed media preview. */
  hue: number;
  icon: IconType;
}

export const SERVICES: ServiceCard[] = [
  {
    index: '01',
    name: 'Organize',
    title: 'Enterprise & Business Management Solutions',
    description:
      'We architect the operational core of your organization by streamlining internal workflows and data systems. From bespoke ERP and CRM implementations to unified management portals, we create integrated ecosystems that enhance department collaboration, reduce manual overhead, and provide real-time visibility into your business performance.',
    chips: ['ERP & CRM', 'Workflow Systems', 'Real-time Visibility'],
    color: '#B49AF6',
    hue: 265,
    icon: FiGrid,
  },
  {
    index: '02',
    name: 'Build',
    title: 'Custom-Built Software & SaaS Engineering',
    description:
      'We transform unique business concepts into robust, scalable software. Whether you require a specialized desktop application or a modern cloud-based SaaS, we provide the full-cycle engineering to bring your specific project to life.',
    chips: ['Custom Software', 'SaaS Engineering', 'Desktop Applications'],
    color: '#EFA8E8',
    hue: 315,
    icon: FiCode,
  },
  {
    index: '03',
    name: 'Architect',
    title: 'Bespoke Web Architectures',
    description:
      'Engineering tailored web environments ranging from high-impact portfolios and e-commerce ecosystems to complex corporate portals. We design for both aesthetic excellence and technical performance, ensuring your digital presence is built to scale.',
    chips: ['Web Architectures', 'E-Commerce Ecosystems', 'Corporate Portals'],
    color: '#C9C2BC',
    hue: 35,
    icon: FiLayout,
  },
  {
    index: '04',
    name: 'Automate',
    title: 'Intelligent Automation & AI Product Engineering',
    description:
      'From individual productivity enhancements to large-scale corporate automation, we engineer the full spectrum of artificial intelligence. We build autonomous AI agents, integrate advanced LLMs into existing platforms, and develop custom cognitive systems, all while ensuring strict data sovereignty and compliance.',
    chips: ['Autonomous AI Agents', 'LLM Integration', 'Cognitive Systems'],
    color: '#ADE87A',
    hue: 110,
    icon: FiCpu,
  },
  {
    index: '05',
    name: 'Grow',
    title: 'Strategic Growth & Market Intelligence',
    description:
      'We empower your expansion through data-driven insights and competitive foresight. By leveraging advanced market analytics and trend forecasting, we identify untapped opportunities and provide the intelligence needed to optimize your market position and outpace the competition.',
    chips: ['Market Analytics', 'Trend Forecasting', 'Competitive Foresight'],
    color: '#8EC5F2',
    hue: 205,
    icon: FiTrendingUp,
  },
  {
    index: '06',
    name: 'Protect',
    title: 'Enterprise Cloud Infrastructure & Resilience',
    description:
      'We design and manage secure, scalable cloud environments tailored to your business needs. From infrastructure setup and cloud migration to monitoring and security, we ensure your systems remain reliable, cost-efficient, and ready to scale as you grow.',
    chips: ['Cloud Migration', 'Infrastructure Setup', 'Security & Resilience'],
    color: '#7FE0C4',
    hue: 165,
    icon: FiShield,
  },
];

/* ── Products ────────────────────────────────────────────── */
export interface Product {
  title: string;
  tagline: string;
  description: string;
  icon: IconType;
  accent: string;
}

export const PRODUCTS: Product[] = [
  {
    title: 'Product Design',
    tagline: 'UX & UI',
    description: 'Research-led product design and bespoke design systems — intuitive SaaS people reach for and never want to leave.',
    icon: FiLayout,
    accent: '#0E8C92',
  },
  {
    title: 'SaaS Engineering',
    tagline: 'Build & ship',
    description: 'Type-safe, composable architecture and infrastructure-as-code that scales cleanly from first MVP to millions of users.',
    icon: FiCode,
    accent: '#5A45E0',
  },
  {
    title: 'AI & Data',
    tagline: 'Intelligence',
    description: 'Production-grade AI woven into the product — retrieval, agents, and evaluation pipelines that actually ship.',
    icon: FiCpu,
    accent: '#DB5A0E',
  },
  {
    title: 'Growth & Analytics',
    tagline: 'Measure & grow',
    description: 'Event streams turned into decisions — live funnels, cohort intelligence, and anomaly alerts that compound.',
    icon: FiTrendingUp,
    accent: '#0E8C92',
  },
];

/* ── Why Choose Us ────────────────────────────────────────── */
export interface TimelineNode {
  label: string;
  detail: string;
}

export const WHY_CHOOSE_US_SUBTITLE =
  "We connect high-level planning with practical implementation, helping ensure that technical decisions support the intended business outcome and remain feasible within the project's constraints.";

export const TIMELINE: TimelineNode[] = [
  {
    label: 'Business-First Approach',
    detail:
      "We don't just build software—we solve problems. Every project starts with understanding your business goals, target users, and market challenges. This ensures the final product delivers real value, not just functionality.",
  },
  {
    label: 'Tailored Custom Solutions',
    detail:
      'No two businesses are the same, so we never rely on one-size-fits-all templates. Every solution is designed and developed from scratch to align perfectly with your workflows, scalability needs, and long-term vision.',
  },
  {
    label: 'Co-Creation & Transparency',
    detail:
      "You aren't just a client; you're a core part of our development team. Through shared workspaces, interactive sprint reviews, and real-time updates, your continuous feedback actively shapes the product at every single stage.",
  },
  {
    label: 'Transparent Collaboration',
    detail:
      'Clear requirements, defined milestones, progress updates, and open discussions help keep stakeholders informed and reduce avoidable surprises throughout the project.',
  },
  {
    label: 'Engineering With Longevity in Mind',
    detail:
      'We consider maintainability, security, performance, and future requirements while making technical decisions, helping create solutions that can evolve beyond their initial release.',
  },
  {
    label: 'Focused on Long-Term Value',
    detail:
      'Our work is guided by the intended business value of the solution. With clearly agreed support and improvement arrangements, we help clients plan for what comes after launch.',
  },
];

/* ── Selected work gallery ───────────────────────────────── */
/**
 * A card's visual. Drop in a real screenshot (`image`) or screen-capture
 * (`video`) and the card renders it; until then `placeholder` shows a themed
 * browser-window mockup built from the item's hue.
 */
export type GalleryMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster?: string }
  | { kind: 'placeholder' };

export interface GalleryItem {
  title: string;
  category: string;
  hue: number;
  media: GalleryMedia;
}

export const GALLERY: GalleryItem[] = [
  { title: 'EPR System', category: 'Enterprise Resource', hue: 190, media: { kind: 'placeholder' } },
  { title: 'Marketplace', category: 'E-Commerce', hue: 265, media: { kind: 'placeholder' } },
  { title: 'E-Auction Platform', category: 'Auction', hue: 25, media: { kind: 'placeholder' } },
  { title: 'AI Enquiry System', category: 'AI & Automation', hue: 200, media: { kind: 'placeholder' } },
  { title: 'Talent Discovery Platform', category: 'HR Tech', hue: 280, media: { kind: 'placeholder' } },
];

/* ── FAQ ─────────────────────────────────────────────────── */
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can you work with businesses that don't have a technical team?",
    answer: "Yes. Many of our clients aren't from a technical background. We simplify the process, explain every stage clearly, and handle the technical complexity so you can focus on your business.",
  },
  {
    question: "What if my requirements change during development?",
    answer: "Requirements often evolve as ideas become clearer. We follow a structured change management process that allows new features and improvements to be incorporated without losing visibility over timelines and costs.",
  },
  {
    question: "How do you determine the cost of a project?",
    answer: "Every project is unique. Pricing depends on factors such as project scope, complexity, integrations, timeline, and overall business objectives. After understanding your requirements, we provide a transparent proposal with no hidden costs.",
  },
  {
    question: "Will my project remain confidential?",
    answer: "Absolutely. We treat every client project, idea, and business requirement with the highest level of confidentiality. Your information is never shared with third parties without your permission, and we're happy to sign a Non-Disclosure Agreement (NDA) whenever required to ensure your project remains fully protected.",
  },
  {
    question: "What happens if I need new features after launch?",
    answer: "Your product doesn't stop evolving after deployment. Whether it's feature additions, performance improvements, or third-party integrations, we're available to help your software continue growing alongside your business.",
  },
  {
    question: "How long does development take?",
    answer: "Timelines vary depending on the scope and complexity of the solution. Once the requirements are established, we can propose milestones, identify dependencies, and provide an estimated delivery schedule.",
  },
  {
    question: "Do you provide support after launch?",
    answer: "Post-launch support and maintenance can be included through an agreed arrangement. The applicable scope, response expectations, maintenance activities, and associated costs are defined according to the project and service agreement.",
  },
  {
    question: "How do we get started?",
    answer: "Start by sharing your business challenge, product idea, or project requirements through our contact form. We will review the information and discuss the next steps, including feasibility, scope, and a suitable way forward.",
  },
];
