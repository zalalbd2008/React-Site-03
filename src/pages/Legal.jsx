import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { PATHS, SITE } from '../config/site.js';
import { LEGAL_DOCS, LEGAL_ORDER } from './legal/documents.js';
import './Legal.css';

export default function Legal({ doc = 'privacy' }) {
  const d = LEGAL_DOCS[doc] || LEGAL_DOCS.privacy;
  const crumbs = [{ label: 'Home', to: PATHS.home }, { label: 'Legal' }, { label: d.t }];

  return (
    <>
      <Seo title={d.t} description={d.intro} jsonLd={breadcrumbJsonLd(crumbs)} />
      <section className="legal-hero">
        <div className="legal-hero__inner">
          <Breadcrumbs items={crumbs} />
          <h1 className="legal-title">{d.t}</h1>
          <p className="legal-dates">Last updated: [Month D, YYYY] · Effective: [Month D, YYYY]</p>
          <nav aria-label="Legal documents" className="legal-tabs">
            {LEGAL_ORDER.map((key) => {
              const it = LEGAL_DOCS[key];
              const on = key === doc;
              return (
                <AppLink key={key} to={it.path} className={`legal-tab${on ? ' is-active' : ''}`} aria-current={on ? 'page' : undefined}>
                  {it.tab || it.t}
                </AppLink>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="legal-body">
        <div className="legal-body__inner">
          <nav aria-label="Sections" className="legal-toc">
            <span className="legal-toc__h">ON THIS PAGE</span>
            {d.sections.map((s) => (
              <a key={s.n} href={`#section-${s.n}`}>{s.n}. {s.h}</a>
            ))}
          </nav>
          <div className="legal-content">
            <div className="legal-warning"><strong>Template structure only.</strong> Final wording must be written or reviewed by qualified legal counsel for your jurisdiction before publishing.</div>
            <p className="legal-intro">{d.intro}</p>
            {d.sections.map((s) => (
              <div key={s.n} id={`section-${s.n}`} className="legal-section">
                <h2>{s.n}. {s.h}</h2>
                <p>{s.b}</p>
              </div>
            ))}
            <div className="legal-contact">
              Questions about this policy? Contact us at <AppLink to={PATHS.contact}>{SITE.legalEmail}</AppLink> or [mailing address].
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
