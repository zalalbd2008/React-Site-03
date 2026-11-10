import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router';
import { SITE } from '../../config/site.js';
import { absoluteUrl } from '../../utils/url.js';

/**
 * Head management without a third-party library.
 * - At prerender time, <Seo> writes into HeadContext; scripts/prerender.mjs injects it into <head>.
 * - In the browser, <Seo> updates document.head after each client-side navigation.
 */
export const HeadContext = createContext(null);

const DEFAULT_TITLE = `${SITE.name} — Dental Marketing Agency`;

export function buildHead({ title, description, path = '/', noindex = false, image, type = 'website', jsonLd } = {}) {
  const fullTitle = title ? `${title} | ${SITE.name}` : DEFAULT_TITLE;
  return {
    title: fullTitle,
    description: description || SITE.description,
    canonical: absoluteUrl(SITE.url, path),
    robots: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    image: absoluteUrl(SITE.url, image || SITE.ogImage),
    type,
    jsonLd: [].concat(jsonLd || []).filter(Boolean),
  };
}

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** JSON for an inline <script type="application/ld+json"> — escapes "<" so data can never close the tag. */
export const safeJson = (obj) => JSON.stringify(obj)
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

/** Serialized <head> tags used by the prerenderer. */
export function headToHtml(h) {
  const meta = (attr, key, content) => `<meta ${attr}="${key}" content="${esc(content)}">`;
  return [
    `<title>${esc(h.title)}</title>`,
    meta('name', 'description', h.description),
    meta('name', 'robots', h.robots),
    `<link rel="canonical" href="${esc(h.canonical)}">`,
    meta('property', 'og:site_name', SITE.name),
    meta('property', 'og:locale', SITE.locale),
    meta('property', 'og:type', h.type),
    meta('property', 'og:title', h.title),
    meta('property', 'og:description', h.description),
    meta('property', 'og:url', h.canonical),
    meta('property', 'og:image', h.image),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', h.title),
    meta('name', 'twitter:description', h.description),
    meta('name', 'twitter:image', h.image),
    ...h.jsonLd.map((j) => `<script type="application/ld+json" data-seo>${safeJson(j)}</script>`),
  ].join('\n    ');
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function applyHead(h) {
  document.title = h.title;
  upsertMeta('name', 'description', h.description);
  upsertMeta('name', 'robots', h.robots);
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
  canon.href = h.canonical;
  upsertMeta('property', 'og:type', h.type);
  upsertMeta('property', 'og:title', h.title);
  upsertMeta('property', 'og:description', h.description);
  upsertMeta('property', 'og:url', h.canonical);
  upsertMeta('property', 'og:image', h.image);
  upsertMeta('name', 'twitter:title', h.title);
  upsertMeta('name', 'twitter:description', h.description);
  upsertMeta('name', 'twitter:image', h.image);
  document.head.querySelectorAll('script[data-seo]').forEach((s) => s.remove());
  for (const j of h.jsonLd) {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.dataset.seo = '';
    s.textContent = JSON.stringify(j); // textContent: never parsed as HTML
    document.head.appendChild(s);
  }
}

/**
 * <Seo title description noindex jsonLd /> — place once at the top of every page.
 * `path` defaults to the current pathname (canonical drops query strings and hashes).
 */
export default function Seo(props) {
  const ctx = useContext(HeadContext);
  const { pathname } = useLocation();
  const head = buildHead({ path: pathname, ...props });

  if (ctx) ctx.head = head; // prerender pass (no effects run on the server)

  const key = JSON.stringify(head);
  useEffect(() => { applyHead(JSON.parse(key)); }, [key]);

  return null;
}
