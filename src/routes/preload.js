import { matchRoutes } from 'react-router';

/**
 * Route-chunk prefetching. Links call preloadPath() on hover/focus/touch so the
 * next page's code is already downloaded by the time the user clicks.
 * The route table is registered at startup to avoid a circular import.
 */
let registered = [];
const done = new Set();

export function registerRoutes(routes) {
  registered = routes;
}

export function preloadPath(to) {
  if (!registered.length || typeof to !== 'string') return Promise.resolve();
  const pathname = to.split(/[?#]/)[0] || '/';
  if (done.has(pathname)) return Promise.resolve();
  done.add(pathname);
  const matches = matchRoutes(registered, pathname) || [];
  return Promise.all(matches.map((m) => (typeof m.route.lazy === 'function' ? m.route.lazy() : null))).catch(() => {
    done.delete(pathname); // allow retry on a flaky network
  });
}

/** Warm up the most-visited routes once the browser is idle (skipped on slow/data-saver connections). */
export function preloadWhenIdle(paths) {
  if (typeof window === 'undefined') return;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return;
  const run = () => paths.forEach((p) => preloadPath(p));
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2500);
}
