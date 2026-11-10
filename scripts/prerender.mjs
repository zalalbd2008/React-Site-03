/**
 * Static prerender (SSG): renders every route to dist/client/<path>/index.html
 * with real content and per-page <head> tags, then writes sitemap.xml and robots.txt.
 * The browser hydrates this HTML, after which navigation is fully client-side.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(root, 'dist/client');
const serverEntry = path.join(root, 'dist/server/entry-server.js');

const siteUrl = (process.env.VITE_SITE_URL || 'https://alphadentalmedia.com').replace(/\/+$/, '');

const { render, prerenderEntries } = await import(pathToFileURL(serverEntry).href);
const template = await fs.readFile(path.join(clientDir, 'index.html'), 'utf8');
const manifest = JSON.parse(await fs.readFile(path.join(clientDir, '.vite/manifest.json'), 'utf8'));

// Preload the latin variable fonts used above the fold
const assets = await fs.readdir(path.join(clientDir, 'assets'));
const fontPreloads = assets
  .filter((f) => /^(inter|manrope)-latin-wght-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`);

/** modulepreload tags for a page chunk and its static imports (avoids a request waterfall). */
function modulePreloads(pageSrc) {
  const out = new Set();
  const walk = (key) => {
    const chunk = manifest[key];
    if (!chunk || out.has(chunk.file)) return;
    out.add(chunk.file);
    (chunk.imports || []).forEach(walk);
  };
  if (pageSrc) walk(pageSrc);
  // Skip chunks Vite already preloads in the template; match its crossorigin mode to avoid double fetches
  return [...out].filter((f) => !template.includes(`/${f}"`)).map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`);
}

const pageFor = (p) => {
  if (p === '/') return 'src/pages/Home.jsx';
  if (p.startsWith('/blog/') && p !== '/blog/') return 'src/pages/Article.jsx';
  const map = {
    '/about/': 'About', '/services/': 'ServicesHub', '/services/dental-seo/': 'ServiceDentalSeo',
    '/specialties/': 'SpecialtiesHub', '/specialties/dental-implants/': 'SpecialtyImplants',
    '/case-studies/implant-practice-growth/': 'CaseStudy', '/blog/': 'Blog', '/free-audit/': 'FreeAudit',
    '/contact/': 'Contact', '/thank-you/': 'ThankYou', '/404': 'NotFound',
  };
  return map[p] ? `src/pages/${map[p]}.jsx` : 'src/pages/Legal.jsx';
};

const entries = prerenderEntries();
let count = 0;
for (const entry of entries) {
  const result = await render(entry.path, siteUrl);
  if (result.redirect) continue;

  const html = template
    .replace('<!--app-preload-->', [...fontPreloads, ...modulePreloads(pageFor(entry.path))].join('\n    '))
    .replace('<!--app-head-->', result.head)
    .replace('<!--app-html-->', result.html);

  const outFile = entry.file
    ? path.join(clientDir, entry.file)
    : path.join(clientDir, entry.path, 'index.html');
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, html);
  count += 1;
}

// sitemap.xml — indexable pages only
const today = new Date().toISOString().slice(0, 10);
const urls = entries.filter((e) => e.sitemap !== false).map((e) => [
  '  <url>',
  `    <loc>${siteUrl}${e.path}</loc>`,
  `    <lastmod>${today}</lastmod>`,
  `    <changefreq>${e.changefreq || 'monthly'}</changefreq>`,
  `    <priority>${(e.priority ?? 0.5).toFixed(1)}</priority>`,
  '  </url>',
].join('\n'));
await fs.writeFile(path.join(clientDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

await fs.writeFile(path.join(clientDir, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

// The SPA shell for unknown URLs is the prerendered 404 page; drop the empty template's root copy
console.log(`Prerendered ${count} pages · sitemap.xml with ${urls.length} URLs`);
