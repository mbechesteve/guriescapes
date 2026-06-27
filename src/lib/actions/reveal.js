/**
 * Adds the `in` class to every `.reveal` element as it scrolls into view.
 * Safe to call repeatedly (after navigation). Falls back to revealing all
 * when IntersectionObserver or reduced-motion applies.
 */
export function initReveals() {
  if (typeof window === 'undefined') return;
  const items = document.querySelectorAll('.reveal:not(.in)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((el) => io.observe(el));
}
