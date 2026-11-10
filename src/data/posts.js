import { PILLAR_SLUG } from '../config/site.js';

/**
 * Blog content index.
 *
 * `status: 'published'` — full article exists; indexed and listed in sitemap.xml.
 * `status: 'draft'`     — topic planned in the design; the article page renders its
 *                         summary with a clear "full article coming soon" notice,
 *                         is marked noindex and is excluded from sitemap.xml.
 * Author/date placeholders are [bracketed] until confirmed.
 */
const post = (slug, cat, t, ex, time, alt, extra = {}) => ({
  slug, cat, t, ex, time, alt, status: 'draft', author: '[Author name]', date: '[Month D, YYYY]', ...extra,
});

export const POSTS = [
  post(PILLAR_SLUG, 'LOCAL SEO', 'The Complete Guide to Local SEO for Dentists',
    'How Google ranks practices in the map pack, what to fix first, and what changes in Houston, Miami, Los Angeles and other major metros.',
    '11 min read', 'Editorial illustration of a dental practice pin rising to the top of a local map',
    { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10', featured: true, pillar: true, label: 'PILLAR GUIDE · LOCAL SEO' }),
  post('dental-seo-what-still-works', 'SEO', 'Dental SEO in 2026: What Still Works and What Doesn’t',
    'A practical look at the ranking factors that matter for practices right now.', '11 min read', 'Illustration of a search results page', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('google-ads-by-procedure-value', 'GOOGLE ADS', 'How to Structure Dental Google Ads by Procedure Value',
    'Why one “dentist” campaign wastes budget, and the structure we use instead.', '11 min read', 'Ad campaign structure diagram', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('reviews-without-privacy-risk', 'REPUTATION', 'Asking for Reviews Without Risking Patient Privacy',
    'Scripts, timing and reply templates that respect HIPAA.', '10 min read', 'Phone showing a review request text', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('ai-overviews-dental-visibility', 'AI SEARCH', 'What AI Overviews Mean for Dental Practice Visibility',
    'How AI answers choose practices, and how to be the one cited.', '10 min read', 'AI assistant interface', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('dental-homepage-above-the-fold', 'WEBSITES', '11 Things Every Dental Homepage Needs Above the Fold',
    'A checklist for turning first-time visitors into booked patients.', '10 min read', 'Website wireframe sketch', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('gbp-categories-for-dentists', 'LOCAL SEO', 'Google Business Profile Categories for Dentists, Explained',
    'Primary vs secondary categories, and the ones most offices miss.', '10 min read', 'Business profile screen', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('social-content-ideas-for-dental-teams', 'SOCIAL', 'Social Media Content Ideas That Make Your Team Familiar',
    'Formats that build trust before a patient ever walks in.', '10 min read', 'Team photo on a phone screen', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('call-tracking-for-dentists', 'GOOGLE ADS', 'Call Tracking for Dentists: Setup and What to Measure',
    'Attribute every new-patient call to the campaign that produced it.', '11 min read', 'Call tracking dashboard', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),
  post('treatment-pages-that-rank', 'SEO', 'Writing Treatment Pages That Rank and Convert',
    'The structure we use for implants, aligners and veneers pages.', '11 min read', 'Treatment page outline', { status: 'published', date: 'November 10, 2026', dateModified: '2026-11-10' }),

  // "Most popular" sidebar topics
  post('dental-marketing-budget', 'GROWTH', 'How Much Should a Dental Practice Spend on Marketing?',
    'Budget ranges by goal and market, and how to judge return by new patients rather than clicks.', '10 min read', 'Budget worksheet', { listed: false }),
  post('dental-seo-checklist', 'SEO', 'Dental SEO Checklist: 40 Items to Review',
    'A practical checklist covering your profile, website, content and links.', '12 min read', 'Checklist', { listed: false }),
  post('invisalign-marketing-ideas', 'GROWTH', 'Invisalign Marketing Ideas That Actually Book Consults',
    'Campaign ideas for aligner consults that turn into starts.', '9 min read', 'Aligner consult', { listed: false }),
  post('responding-to-negative-reviews', 'REPUTATION', 'Responding to Negative Dental Reviews (With Templates)',
    'Calm, privacy-safe reply templates for the reviews that sting.', '8 min read', 'Review reply', { listed: false }),
  post('dental-marketing-glossary', 'GLOSSARY', 'Dental Marketing Glossary: 60 Terms Explained',
    'Plain-English definitions of the marketing terms practice owners hear most.', '15 min read', 'Glossary', { listed: false }),
];

export const POPULAR_SLUGS = [
  'dental-marketing-budget', 'dental-seo-checklist', 'invisalign-marketing-ideas', 'responding-to-negative-reviews', 'dental-marketing-glossary',
];

export const BLOG_CATEGORIES = ['All', 'SEO', 'LOCAL SEO', 'GOOGLE ADS', 'WEBSITES', 'REPUTATION', 'AI SEARCH', 'SOCIAL'];

export const findPost = (slug) => POSTS.find((p) => p.slug === slug);
export const listedPosts = () => POSTS.filter((p) => p.listed !== false && !p.featured);
export const publishedPosts = () => POSTS.filter((p) => p.status === 'published');

/** Display label for a category code, e.g. 'GOOGLE ADS' → 'Google Ads', 'AI SEARCH' → 'AI search'. */
export function categoryLabel(c) {
  if (c === 'All') return 'All topics';
  return c.charAt(0) + c.slice(1).toLowerCase().replace('seo', 'SEO').replace('ai ', 'AI ').replace('ads', 'Ads');
}
