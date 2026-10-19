import type { MouseEvent, ReactNode } from 'react';
import { scrollToSection } from '@/lib/scrollToSection';

interface SectionLinkProps {
  sectionId: string;
  className?: string;
  children: ReactNode;
}

/** Sections are not focusable by default; make the target one, without a ring around the whole section. */
function moveFocusTo(target: HTMLElement): void {
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    target.style.outline = 'none';
  }
  target.focus({ preventScroll: true });
}

/**
 * In-page anchor that glides through Lenis, and still works as a plain `#id` link without JS.
 * Leaves new-tab / modified clicks and missing targets to the browser, and moves focus to the
 * section so keyboard and screen-reader users land there rather than staying in the footer.
 */
export function SectionLink({ sectionId, className, children }: SectionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || event.button !== 0 || isModified) return;

    const target = document.getElementById(sectionId);
    if (!target) return;

    event.preventDefault();
    scrollToSection(sectionId);
    moveFocusTo(target);
  };

  return (
    <a href={`#${sectionId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
