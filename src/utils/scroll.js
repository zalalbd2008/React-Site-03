/**
 * Smooth scrolling (CSS scroll-behavior) is great for in-page #anchors but makes page
 * changes animate from the old scroll position. Links call this right before a
 * cross-page navigation; SiteLayout re-enables smoothing once the new page has settled.
 */
export function suspendSmoothScroll() {
  if (typeof document !== 'undefined') document.documentElement.classList.add('is-routing');
}

export function resumeSmoothScroll() {
  if (typeof document === 'undefined') return () => {};
  const id = requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('is-routing')));
  return () => cancelAnimationFrame(id);
}
