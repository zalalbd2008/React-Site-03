/** URL helpers that keep navigation inside the app and block unsafe schemes. */

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** True for same-origin app paths like "/blog/" or "/services/#seo" (not "//evil.com"). */
export function isInternalPath(href) {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/\\');
}

/** Returns a safe external href, or null for javascript:, data:, malformed URLs etc. */
export function safeExternalHref(href) {
  if (typeof href !== 'string' || !href) return null;
  try {
    const u = new URL(href);
    return SAFE_PROTOCOLS.has(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

/**
 * Validates a redirect target taken from user-controllable input (query string etc.).
 * Only same-origin relative paths are allowed; everything else falls back.
 */
export function safeRedirectPath(target, fallback = '/') {
  if (!isInternalPath(target)) return fallback;
  try {
    const u = new URL(target, 'https://placeholder.invalid');
    return u.origin === 'https://placeholder.invalid' ? `${u.pathname}${u.search}${u.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export const absoluteUrl = (siteUrl, path = '/') => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
