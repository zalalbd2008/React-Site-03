import { PATHS, PILLAR_SLUG } from './site.js';
import { SERVICE_GROUPS, ALL_SERVICES } from '../data/services.js';
import { SPECIALTIES } from '../data/specialties.js';

export const RESOURCES_MENU = [
  { t: 'Blog', d: 'Weekly dental marketing insights', href: PATHS.blog },
  { t: 'Dental Marketing Guides', d: 'Step-by-step playbooks', href: PATHS.article(PILLAR_SLUG) },
  { t: 'SEO Guides', d: 'Rank higher, locally and in AI search', href: `${PATHS.blog}?topic=SEO` },
  { t: 'Free Tools & Templates', d: 'Checklists, calculators, swipe files', href: `${PATHS.blog}#free-resources` },
  { t: 'Marketing Glossary', d: 'Plain-English definitions', href: PATHS.article('dental-marketing-glossary') },
  { t: 'FAQ', d: 'Answers for practice owners', href: '/#faq' },
];

/** Primary navigation — order and ids match the Header artboard. */
export const PRIMARY_NAV = [
  { id: 'services', label: 'Services', panel: 'services', href: PATHS.services },
  { id: 'specialties', label: 'Specialties', panel: 'specialties', href: PATHS.specialties },
  { id: 'results', label: 'Results', href: PATHS.caseStudy },
  { id: 'resources', label: 'Resources', panel: 'resources', href: PATHS.blog },
  { id: 'about', label: 'About', href: PATHS.about },
];

export const MENU_DATA = {
  services: SERVICE_GROUPS,
  specialties: SPECIALTIES,
  resources: RESOURCES_MENU,
};

/** Mobile navigation sections (HomeMobile artboard). */
export const MOBILE_NAV = [
  { t: 'Services', items: [...ALL_SERVICES.map((s) => ({ t: s.t, href: s.href })), { t: 'All services', href: PATHS.services }] },
  { t: 'Specialties', items: [...SPECIALTIES.map((s) => ({ t: s.t, href: s.href })), { t: 'All specialties', href: PATHS.specialties }] },
  { t: 'Results', items: [{ t: 'Case studies', href: PATHS.caseStudy }] },
  { t: 'Resources', items: RESOURCES_MENU.map((r) => ({ t: r.t, href: r.href })) },
  { t: 'About', items: [{ t: 'About us', href: PATHS.about }, { t: 'Contact', href: PATHS.contact }] },
];

const L = (t, href) => ({ t, href });

export const FOOTER_COLUMNS = [
  { h: 'Services', links: [
    L('Dental SEO', PATHS.dentalSeo), L('Local SEO', `${PATHS.services}#local-seo`), L('Google Ads & PPC', `${PATHS.services}#google-ads`),
    L('Website Design', `${PATHS.services}#website-design`), L('Reputation Management', `${PATHS.services}#reputation`),
    L('AI Search Optimization', `${PATHS.services}#ai-search`), L('All Services', PATHS.services),
  ] },
  { h: 'Specialties', links: [
    L('General Dentists', `${PATHS.specialties}#general-dentists`), L('Cosmetic Dentists', `${PATHS.specialties}#cosmetic-dentists`),
    L('Orthodontists', `${PATHS.specialties}#orthodontists`), L('Dental Implants', PATHS.implants),
    L('Pediatric Dentists', `${PATHS.specialties}#pediatric-dentists`), L('Multi-Location Groups', `${PATHS.specialties}#multi-location`),
  ] },
  { h: 'Resources', links: [
    L('Blog', PATHS.blog), L('Marketing Guides', PATHS.article(PILLAR_SLUG)), L('SEO Guides', `${PATHS.blog}?topic=SEO`),
    L('Free Resources', `${PATHS.blog}#free-resources`), L('Glossary', PATHS.article('dental-marketing-glossary')), L('FAQ', '/#faq'),
  ] },
  { h: 'Company', links: [
    L('About Us', PATHS.about), L('Our Approach', `${PATHS.about}#approach`), L('Case Studies', PATHS.caseStudy),
    L('Contact', PATHS.contact), L('Free Audit', PATHS.freeAudit), L('Request a Proposal', `${PATHS.contact}?topic=proposal`),
  ] },
];

export const LEGAL_LINKS = [
  L('Privacy Policy', PATHS.privacy), L('Terms & Conditions', PATHS.terms), L('Cookie Policy', PATHS.cookies),
  L('Disclaimer', PATHS.disclaimer), L('Accessibility', PATHS.accessibility),
];
