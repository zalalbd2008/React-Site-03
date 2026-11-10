import { PATHS } from '../config/site.js';

/**
 * The 12 services from the Services mega menu, grouped by goal.
 * `href` points at a dedicated page when one exists; otherwise at the service's
 * entry on the Services hub, so no menu item leads to a page with borrowed content.
 */
const svc = (slug, t, d, page) => ({ slug, t, d, href: page || `${PATHS.services}#${slug}` });

export const SERVICE_GROUPS = [
  {
    id: 'found',
    h: 'Get found',
    intro: 'Be the practice patients see first — in Google, in the map pack and in AI answers.',
    items: [
      svc('dental-seo', 'Dental SEO', 'Rank for the treatments that grow production', PATHS.dentalSeo),
      svc('local-seo', 'Local SEO & Maps', 'Win the map pack in your service area'),
      svc('google-business-profile', 'Google Business Profile', 'Optimize the profile patients see first'),
      svc('ai-search', 'AI Search Optimization', 'Be the practice AI assistants recommend'),
    ],
  },
  {
    id: 'chosen',
    h: 'Get chosen',
    intro: 'Give searching patients every reason to pick you over the practice down the street.',
    items: [
      svc('google-ads', 'Dental Google Ads & PPC', 'Paid search built on cost per new patient'),
      svc('social-media', 'Social Media Marketing', 'Content and ads that build local trust'),
      svc('reputation', 'Reputation Management', 'More reviews, better replies, higher ratings'),
      svc('content', 'Content Marketing', 'Treatment pages and articles patients read'),
    ],
  },
  {
    id: 'booked',
    h: 'Get booked',
    intro: 'Turn visits into appointments with a fast, trustworthy website.',
    items: [
      svc('website-design', 'Dental Website Design', 'Premium, fast, ADA-minded practice websites'),
      svc('website-development', 'Website Development', 'Booking, forms and integrations done right'),
      svc('cro', 'Conversion Rate Optimization', 'Turn more visitors into booked visits'),
      svc('growth-strategy', 'Practice Growth Strategy', 'One plan across every channel'),
    ],
  },
];

export const ALL_SERVICES = SERVICE_GROUPS.flatMap((g) => g.items);

export const findService = (slug) => ALL_SERVICES.find((s) => s.slug === slug);
