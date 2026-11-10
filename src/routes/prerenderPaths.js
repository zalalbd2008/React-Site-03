import { PATHS } from '../config/site.js';
import { POSTS } from '../data/posts.js';

/**
 * Every URL that gets a static HTML file at build time (and, when indexable, a sitemap entry).
 * Drafts are prerendered (so direct visits work) but carry noindex and are left out of sitemap.xml.
 */
export function prerenderEntries() {
  const core = [
    { path: PATHS.home, priority: 1.0, changefreq: 'weekly' },
    { path: PATHS.services, priority: 0.8 },
    { path: PATHS.dentalSeo, priority: 0.9 },
    { path: PATHS.specialties, priority: 0.8 },
    { path: PATHS.implants, priority: 0.9 },
    { path: PATHS.about, priority: 0.7 },
    { path: PATHS.caseStudy, priority: 0.7 },
    { path: PATHS.blog, priority: 0.8, changefreq: 'weekly' },
    { path: PATHS.freeAudit, priority: 0.9 },
    { path: PATHS.contact, priority: 0.8 },
    { path: PATHS.thankYou, sitemap: false },
    { path: PATHS.privacy, priority: 0.3 },
    { path: PATHS.terms, priority: 0.3 },
    { path: PATHS.cookies, priority: 0.3 },
    { path: PATHS.disclaimer, priority: 0.3 },
    { path: PATHS.accessibility, priority: 0.3 },
  ];
  const posts = POSTS.map((p) => ({ path: PATHS.article(p.slug), priority: 0.6, sitemap: p.status === 'published' }));
  return [...core, ...posts, { path: '/404', sitemap: false, file: '404.html' }];
}
