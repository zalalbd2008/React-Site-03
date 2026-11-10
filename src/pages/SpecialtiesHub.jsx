import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import Button from '../components/ui/Button.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { SPECIALTIES } from '../data/specialties.js';
import { PATHS, SITE } from '../config/site.js';
import { absoluteUrl } from '../utils/url.js';
import './ServicesHub.css';

const CRUMBS = [{ label: 'Home', to: PATHS.home }, { label: 'Specialties' }];

const DESCRIPTION = 'Dental marketing shaped around your kind of dentistry — general, cosmetic, orthodontic, pediatric, implant, periodontal, endodontic, oral surgery and multi-location groups.';

const itemListJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Dental specialties we market',
  itemListElement: SPECIALTIES.map((s, i) => ({
    '@type': 'ListItem', position: i + 1, name: s.t, url: absoluteUrl(SITE.url, s.href),
  })),
});

const hasPage = (s) => !s.href.startsWith(`${PATHS.specialties}#`);

export default function SpecialtiesHub() {
  return (
    <div className="hub">
      <Seo title="Marketing by Dental Specialty" description={DESCRIPTION} jsonLd={[itemListJsonLd(), breadcrumbJsonLd(CRUMBS)]} />

      <section aria-labelledby="hub-sp-h1" className="hub-hero">
        <div className="container stack gap-40">
          <Breadcrumbs items={CRUMBS} dark />
          <div className="stack hub-hero__copy hub-maxw">
            <span className="eyebrow eyebrow--peach">SPECIALTY MARKETING</span>
            <h1 id="hub-sp-h1" className="hub-hero__title">Marketing shaped around your kind of dentistry</h1>
            <p className="lead">Every specialty attracts different patients with different questions. We build the plan around the cases you want more of.</p>
            <div className="hub-actions">
              <Button to={PATHS.freeAudit}>Get a Free Audit</Button>
              <Button to={PATHS.contact} variant="outline-dark">Book a Free Consultation</Button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="hub-sp-list-h" className="section">
        <div className="container stack gap-40">
          <h2 id="hub-sp-list-h" className="h2 hub-h2 hub-maxw">Choose your specialty</h2>
          <div className="hub-grid">
            {SPECIALTIES.map((s) => (
              <article key={s.slug} id={s.slug} className={`hub-card hub-card--spec lift${hasPage(s) ? ' hub-card--page' : ''}`}>
                <span className="hub-mono" aria-hidden="true">{s.k}</span>
                <h3 className="hub-card__t">{s.t}</h3>
                <p className="small">{s.d}</p>
                {hasPage(s)
                  ? <AppLink to={s.href} className="hub-card__cta">Explore {s.t.toLowerCase()} marketing →</AppLink>
                  : <AppLink to={`${PATHS.contact}?interest=${encodeURIComponent(s.t)}`} className="hub-card__cta">Ask about {s.t.toLowerCase()} →</AppLink>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="hub-sp-cta-h" className="section section--navy">
        <div className="container hub-cta">
          <div className="stack gap-12">
            <span className="eyebrow eyebrow--peach">FREE FOR PRACTICE OWNERS</span>
            <h2 id="hub-sp-cta-h" className="h2 hub-h2 on-dark">See exactly why patients choose the practice down the street</h2>
            <p>A personal audit of your Google ranking, reviews, website and ads.</p>
          </div>
          <div className="hub-actions">
            <Button to={PATHS.freeAudit}>Get My Free Audit</Button>
            <Button to={PATHS.services} variant="outline-dark">See all services</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
