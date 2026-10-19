import {
  FiHome,
  FiZap,
  FiGrid,
  FiHelpCircle,
  FiSend,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';

export interface NavItem {
  id: string;
  label: string;
  icon: IconType;
}

/** Section ids here MUST match the `id` props rendered in App.tsx. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Home', icon: FiHome },
  { id: 'capabilities', label: 'Clients', icon: FiZap },
  { id: 'stack', label: 'Services', icon: FiGrid },
  { id: 'faq', label: 'FAQ', icon: FiHelpCircle },
  { id: 'contact', label: 'Contact', icon: FiSend },
];
