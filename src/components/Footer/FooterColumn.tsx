import { motion } from 'framer-motion';
import { fadeUp } from '@/animations/motionVariants';
import type { FooterLink } from '@/data/footer';
import { SectionLink } from './SectionLink';

/** Mono label shared by every column heading in the footer. */
export const COLUMN_HEADING =
  'mb-[clamp(0.5rem,1.5svh,1.25rem)] font-mono text-xs uppercase tracking-[0.25em] text-ink-900/65';

export const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-violet';

interface FooterColumnProps {
  title: string;
  links: readonly FooterLink[];
}

/** A titled list of section links. Reveals through the parent's stagger. */
export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <motion.nav variants={fadeUp} aria-label={title}>
      <h2 className={COLUMN_HEADING}>{title}</h2>
      <ul className="flex flex-col lg:gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <SectionLink
              sectionId={link.sectionId}
              className={`group inline-block py-[3px] text-[0.9375rem] leading-snug text-ink-900/80 transition-colors duration-300 hover:text-ink-950 lg:py-0 lg:text-sm ${FOCUS_RING}`}
            >
              <span className="relative">
                {/* Long service titles get short names below `lg`, so the grid stays one frame tall. */}
                {link.shortLabel ? (
                  <>
                    <span className="lg:hidden">{link.shortLabel}</span>
                    <span className="hidden lg:inline">{link.label}</span>
                  </>
                ) : (
                  link.label
                )}
                {/* Underline draws in from the left on hover / keyboard focus. */}
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </span>
            </SectionLink>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
