/**
 * Central site configuration.
 *
 * Values in [square brackets] are placeholders carried over from the design.
 * Replace them with confirmed facts before launch — they render exactly as written.
 */

const env = import.meta.env ?? {};

export const SITE = {
  name: 'Alpha Dental Media',
  legalName: 'Alpha Dental Media',
  url: (env.VITE_SITE_URL || 'https://alphadentalmedia.com').replace(/\/+$/, ''),
  description:
    'A digital marketing agency built only for dental practices — SEO, Google Ads, websites and reputation, measured by new patients, not clicks.',
  locale: 'en_US',
  ogImage: '/og-default.png',

  // Contact — placeholders until confirmed
  phoneDisplay: '[Phone number]',
  phoneHref: '', // e.g. 'tel:+15555550123' — leave empty until the real number exists
  email: '[hello@alphadentalmedia.com]',
  emailHref: '', // e.g. 'mailto:hello@alphadentalmedia.com'
  legalEmail: '[legal@alphadentalmedia.com]',
  address: '[Street address, City, State ZIP]',
  hours: '[Mon–Fri, 8am–6pm CT]',

  // Social profiles. Leave href empty until the profile exists; empty links are not rendered as links.
  social: [
    { key: 'in', label: 'LinkedIn', href: '' },
    { key: 'f', label: 'Facebook', href: '' },
    { key: 'ig', label: 'Instagram', href: '' },
    { key: 'yt', label: 'YouTube', href: '' },
  ],

  leadEndpoint: env.VITE_LEAD_ENDPOINT || '/api/lead',
  copyrightYear: 2026,
};

/** Route paths in one place so links never drift from the router. */
export const PATHS = {
  home: '/',
  about: '/about/',
  services: '/services/',
  dentalSeo: '/services/dental-seo/',
  specialties: '/specialties/',
  implants: '/specialties/dental-implants/',
  caseStudies: '/case-studies/',
  caseStudy: '/case-studies/implant-practice-growth/',
  blog: '/blog/',
  article: (slug) => `/blog/${slug}/`,
  freeAudit: '/free-audit/',
  contact: '/contact/',
  thankYou: '/thank-you/',
  privacy: '/privacy-policy/',
  terms: '/terms/',
  cookies: '/cookie-policy/',
  disclaimer: '/disclaimer/',
  accessibility: '/accessibility/',
};

export const PILLAR_SLUG = 'local-seo-for-dentists';
