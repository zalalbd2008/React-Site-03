import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import Button from '../components/ui/Button.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { SERVICE_GROUPS, ALL_SERVICES } from '../data/services.js';
import { PATHS, SITE } from '../config/site.js';
import { absoluteUrl } from '../utils/url.js';
import './ServicesHub.css';

const CRUMBS = [{ label: 'Home', to: PATHS.home }, { label: 'Services' }];

const DESCRIPTION = 'Dental SEO, Google Ads, websites, reputation and more — every service Alpha Dental Media offers, grouped by how it helps patients find, choose and book your practice.';

const itemListJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Dental marketing services',
  itemListElement: ALL_SERVICES.map((s, i) => ({
    '@type': 'ListItem', position: i + 1, name: s.t, url: absoluteUrl(SITE.url, s.href),
  })),
});

/** True when the service has its own dedicated page (not a hub anchor). */
const hasPage = (s) => !s.href.startsWith(`${PATHS.services}#`);

export default function ServicesHub() {
  return (
    <div className="hub">
      <Seo title="Dental Marketing Services" description={DESCRIPTION} jsonLd={[itemListJsonLd(), breadcrumbJsonLd(CRUMBS)]} />

      <section aria-labelledby="hub-h1" className="hub-hero">
        <div className="container stack gap-40">
          <Breadcrumbs items={CRUMBS} dark />
          <div className="hub-hero__grid">
            <div className="stack hub-hero__copy">
              <span className="eyebrow eyebrow--peach">DENTAL MARKETING SERVICES</span>
              <h1 id="hub-h1" className="hub-hero__title">Everything a practice needs to get found, chosen and booked</h1>
              <p className="lead">{SITE.description}</p>
              <div className="hub-actions">
                <Button to={PATHS.freeAudit}>Get a Free Audit</Button>
                <Button to={PATHS.contact} variant="outline-dark">Book a Free Consultation</Button>
              </div>
            </div>
            <nav aria-label="Service groups" className="hub-groups-nav">
              {SERVICE_GROUPS.map((g, i) => (
                <a key={g.id} href={`#${g.id}`} className="hub-groups-nav__item">
                  <span className="hub-groups-nav__n">{`0${i + 1}`}</span>
                  <span className="stack">
                    <span className="hub-groups-nav__t">{g.h}</span>
                    <span className="hub-groups-nav__d">{g.intro}</span>
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {SERVICE_GROUPS.map((g, gi) => (
        <section key={g.id} id={g.id} aria-labelledby={`hub-${g.id}-h`} className={`section hub-anchor${gi % 2 ? ' section--alt' : ''}`}>
          <div className="container stack gap-40">
            <div className="stack gap-16 hub-maxw">
              <span className="eyebrow">{`0${gi + 1} · ${g.h.toUpperCase()}`}</span>
              <h2 id={`hub-${g.id}-h`} className="h2 hub-h2">{g.h}</h2>
              <p className="hub-intro">{g.intro}</p>
            </div>
            <div className="hub-grid">
              {g.items.map((s) => (
                <article key={s.slug} id={s.slug} className={`hub-card lift${hasPage(s) ? ' hub-card--page' : ''}`}>
                  <h3 className="hub-card__t">{s.t}</h3>
                  <p className="small">{s.d}</p>
                  {hasPage(s)
                    ? <AppLink to={s.href} className="hub-card__cta">Explore {s.t} →</AppLink>
                    : <AppLink to={`${PATHS.contact}?interest=${encodeURIComponent(s.t)}`} className="hub-card__cta">Ask about this service →</AppLink>}
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="hub-cta-h" className="section section--navy">
        <div className="container hub-cta">
          <div className="stack gap-12">
            <span className="eyebrow eyebrow--peach">FREE FOR PRACTICE OWNERS</span>
            <h2 id="hub-cta-h" className="h2 hub-h2 on-dark">See exactly why patients choose the practice down the street</h2>
            <p>A personal audit of your Google ranking, reviews, website and ads.</p>
          </div>
          <div className="hub-actions">
            <Button to={PATHS.freeAudit}>Get My Free Audit</Button>
            <Button to={PATHS.contact} variant="outline-dark">Talk to a strategist</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
