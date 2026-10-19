import { FiInstagram, FiLinkedin } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { SERVICES } from './content';

export interface FooterLink {
  label: string;
  /** Compact name for narrow screens, where the full label would wrap to several lines. */
  shortLabel?: string;
  /** Section id from App.tsx — these MUST match the `id` props rendered there. */
  sectionId: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: IconType;
}

export const STUDIO_LINKS: readonly FooterLink[] = [
  { label: 'Services', sectionId: 'stack' },
  { label: 'About', sectionId: 'unicorn-team' },
  { label: 'FAQ', sectionId: 'faq' },
  { label: 'Contact', sectionId: 'contact' },
];

/** One link per service card, so the footer never drifts from the Services section. */
export const SERVICE_LINKS: readonly FooterLink[] = SERVICES.map(({ name, title }) => ({
  label: title,
  shortLabel: name,
  sectionId: 'stack',
}));

export const SOCIALS: readonly SocialLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/kapidhwaj.innovations', icon: FiInstagram },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/kapidhwajinnovations/', icon: FiLinkedin },
];
