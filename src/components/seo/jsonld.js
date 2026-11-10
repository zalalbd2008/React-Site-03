import { SITE } from '../../config/site.js';
import { absoluteUrl } from '../../utils/url.js';

/** Structured-data builders (schema.org). Keep them truthful: no Review/AggregateRating markup without real reviews. */

const abs = (p) => absoluteUrl(SITE.url, p);

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: abs('/favicon.svg'),
  description: SITE.description,
  sameAs: SITE.social.map((s) => s.href).filter(Boolean),
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: `${SITE.url}/`,
  name: SITE.name,
  publisher: { '@id': `${SITE.url}/#organization` },
});

/** items: [{ label, to }] — same shape as <Breadcrumbs>. */
export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: it.label, ...(it.to ? { item: abs(it.to) } : {}),
  })),
});

/** items: [{ q, a }] where a is plain text. */
export const faqJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: typeof f.a === 'string' ? f.a : f.aText || '' },
  })),
});

export const serviceJsonLd = ({ name, description, path, serviceType }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name, description, serviceType: serviceType || name,
  url: abs(path),
  provider: { '@id': `${SITE.url}/#organization` },
  audience: { '@type': 'Audience', audienceType: 'Dental practices' },
});

/** images: absolute/relative URL strings or { src, caption, width, height } (infographics). */
const imageObject = (im) => (typeof im === 'string' ? abs(im) : {
  '@type': 'ImageObject', contentUrl: abs(im.src), url: abs(im.src),
  ...(im.caption ? { caption: im.caption } : {}), ...(im.width ? { width: im.width, height: im.height } : {}),
});

export const articleJsonLd = ({ title, description, path, datePublished, dateModified, authorName, images }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  ...(images?.length ? { image: images.map(imageObject) } : {}),
  mainEntityOfPage: abs(path),
  ...(datePublished ? { datePublished } : {}),
  ...(dateModified ? { dateModified } : {}),
  ...(authorName && !authorName.startsWith('[') ? { author: { '@type': 'Person', name: authorName } } : {}),
  publisher: { '@id': `${SITE.url}/#organization` },
});
