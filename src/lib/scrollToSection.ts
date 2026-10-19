/** Smooth-scrolls to a section by id, through Lenis when it is running. */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset: 0, duration: 1.2 });
  } else {
    // Lenis is off for reduced-motion users; the native fallback must not animate either.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
}
