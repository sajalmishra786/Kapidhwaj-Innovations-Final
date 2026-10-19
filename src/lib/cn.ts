import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Without this, `text-display` / `text-hero` (the custom sizes in tailwind.config)
 * are read as text *colours*, and silently dropped whenever a real colour follows
 * them in the same call.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['hero', 'display'] }],
    },
  },
});

/** Conditional className merge with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
