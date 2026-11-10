/**
 * Client-side validation. This is for user experience only —
 * api/lead.js re-validates everything on the server.
 */

const EMAIL_RE = /^[^@\s<>()[\]\\,;:"]+@[^@\s<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const HOST_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export const LIMITS = { short: 120, medium: 200, long: 2000 };

/** Strip control characters and trim; keep normal punctuation and unicode letters. */
export function clean(value, max = LIMITS.medium) {
  return String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

export const isEmail = (v) => EMAIL_RE.test(clean(v, 254));

export const digitsOnly = (v) => String(v ?? '').replace(/\D/g, '');

/** US-style phone: 10 digits, or 11 starting with 1. */
export const isPhone = (v) => {
  const d = digitsOnly(v);
  return d.length === 10 || (d.length === 11 && d.startsWith('1'));
};

/**
 * Accepts "smithdental.com", "www.smithdental.com" or a full http(s) URL.
 * Returns a normalized https URL string, or '' when invalid.
 */
export function normalizeWebsite(input) {
  let v = clean(input, 253);
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (!['http:', 'https:'].includes(u.protocol)) return '';
    if (u.username || u.password) return '';
    if (!HOST_RE.test(u.hostname)) return '';
    return `${u.protocol}//${u.hostname}${u.pathname === '/' ? '' : u.pathname}`;
  } catch {
    return '';
  }
}

export const isWebsite = (v) => normalizeWebsite(v) !== '';

/** Rule builders used by forms. Each returns '' when valid or an error message. */
export const rules = {
  name: (v) => (clean(v).length > 1 ? '' : 'Please enter your name.'),
  email: (v) => (isEmail(v) ? '' : 'Enter a valid email address.'),
  optionalPhone: (v) => (!clean(v) || isPhone(v) ? '' : 'Enter a 10-digit phone number or leave blank.'),
  website: (v) => (isWebsite(v) ? '' : 'Enter your website, e.g. smithdental.com.'),
  city: (v) => (clean(v).length > 1 ? '' : 'Enter the city you practice in.'),
  practice: (v) => (clean(v) ? '' : 'Enter your practice name.'),
  required: (msg) => (v) => (clean(v) ? '' : msg),
};
