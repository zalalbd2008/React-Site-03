import Seo from '../components/seo/Seo.jsx';
import { articleJsonLd, breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import Button from '../components/ui/Button.jsx';
import { CheckIcon } from '../components/ui/Icons.jsx';
import { PATHS } from '../config/site.js';
import { findService } from '../data/services.js';
import './CaseStudy.css';

const TITLE = 'How [Practice name] built a predictable implant consultation pipeline';
const DESCRIPTION = 'Case study: how an implant and restorative practice built a predictable implant consultation pipeline with dental SEO, Google Ads, reputation management and conversion optimization.';

const CRUMBS = [
  { label: 'Home', to: PATHS.home },
  { label: 'Case Studies', to: PATHS.caseStudy },
  { label: '[Practice name]' },
];

const FACTS = [
  { k: 'PRACTICE TYPE', v: '[Implant & restorative]' },
  { k: 'LOCATION', v: '[City, State]' },
  { k: 'ENGAGEMENT', v: '[Month YYYY] – present' },
  { k: 'OFFICES', v: '[1]' },
];

const METRICS = [
  { v: '[+000%]', l: 'Implant consultations booked', p: '[Period, source]' },
  { v: '[$000]', l: 'Cost per implant consultation', p: '[Period, source]' },
  { v: '[00]', l: 'Implant keywords in Google top 3', p: '[Date, tool]' },
  { v: '[0.0]★', l: 'Google rating ([000] reviews)', p: '[Date]' },
];

const SERVICES = [
  { t: 'Dental SEO', slug: 'dental-seo' },
  { t: 'Google Ads & PPC', slug: 'google-ads' },
  { t: 'Reputation Management', slug: 'reputation' },
  { t: 'Conversion Optimization', slug: 'cro' },
].map((s) => ({ ...s, href: findService(s.slug)?.href || PATHS.services }));

const CHAPTERS = [
  { n: '01', t: 'The challenge', b: '[Describe where the practice started: visibility, lead quality, website, staff capacity. Specific, verifiable, in the client’s words where possible.]', pts: ['[Starting point 1]', '[Starting point 2]', '[Starting point 3]'] },
  { n: '02', t: 'Objectives', b: '[What success meant to the practice: a number of consultations, a case mix, a cost ceiling.]', pts: ['[Objective 1]', '[Objective 2]'] },
  { n: '03', t: 'Strategy', b: '[Which channels, in what order, and why. Tie each decision to the implant patient journey.]', pts: ['[Strategic decision 1]', '[Strategic decision 2]', '[Strategic decision 3]'] },
  { n: '04', t: 'Implementation', b: '[What was built and launched, month by month, including what didn’t work at first and how it was fixed.]', pts: ['[Milestone 1]', '[Milestone 2]', '[Milestone 3]'] },
];

const BARS = [22, 26, 30, 34, 40, 48, 52, 58, 64, 70, 76, 82];
const TAKEAWAYS = ['[Lesson other implant practices can apply]', '[Second lesson]', '[Third lesson]'];
const MORE = [
  { tag: 'ORTHODONTICS', t: '[Practice]: more adult aligner consultations', alt: 'Orthodontist with adult patient' },
  { tag: 'MULTI-LOCATION', t: '[Group]: map pack across [0] offices', alt: 'Dental group exterior' },
  { tag: 'GENERAL DENTISTRY', t: '[Practice]: filling the hygiene schedule', alt: 'Hygienist with family patient' },
];

export default function CaseStudy() {
  return (
    <div className="cs">
      <Seo
        title="Case Study: Implant Consultation Pipeline"
        description={DESCRIPTION}
        type="article"
        jsonLd={[
          articleJsonLd({ title: TITLE, description: DESCRIPTION, path: PATHS.caseStudy }),
          breadcrumbJsonLd(CRUMBS),
        ]}
      />

      <section aria-labelledby="cs-h1" className="cs-hero">
        <div className="container stack gap-32">
          <Breadcrumbs items={CRUMBS} dark />
          <div className="cs-banner" role="note">Template · Every figure, quote and name below is a placeholder. Publish only with verified data and written client approval.</div>
          <div className="cs-hero__grid">
            <div className="stack gap-16">
              <span className="eyebrow eyebrow--peach">CASE STUDY · DENTAL IMPLANTS · [CITY, STATE]</span>
              <h1 id="cs-h1" className="cs-hero__title">{TITLE}</h1>
            </div>
            <dl className="cs-facts">
              {FACTS.map((f) => (
                <div key={f.k}>
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <PhotoSlot
            className="cs-hero__img"
            label="Exterior of the client dental practice at golden hour"
            tag="CLIENT PHOTO · WITH PERMISSION"
            cap="Practice exterior or doctor portrait at golden hour"
            ratio="21 / 8"
          />
        </div>
      </section>

      <section aria-label="Results" className="cs-metrics-wrap">
        <div className="cs-metrics">
          {METRICS.map((m) => (
            <div key={m.l} className="cs-metric">
              <span className="cs-metric__v">{m.v}</span>
              <span className="cs-metric__l">{m.l}</span>
              <span className="cs-metric__p">{m.p}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cs-body">
        <div className="container cs-body__layout">
          <aside className="cs-side" aria-label="Engagement summary">
            <div className="cs-side__box">
              <span className="cs-side__h">SERVICES USED</span>
              {SERVICES.map((s) => (
                <AppLink key={s.slug} to={s.href} className="cs-side__link">{s.t}<span aria-hidden="true">→</span></AppLink>
              ))}
            </div>
            <Button to={PATHS.contact} block>Get Results Like These</Button>
          </aside>

          <div className="cs-story">
            {CHAPTERS.map((c) => (
              <div key={c.n} className="cs-chapter">
                <span className="cs-chapter__n" aria-hidden="true">{c.n}</span>
                <div className="cs-chapter__body">
                  <h2 className="cs-chapter__t">{c.t}</h2>
                  <p>{c.b}</p>
                  <ul>{c.pts.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              </div>
            ))}

            <figure className="cs-chart">
              <div className="cs-chart__box">
                <span className="cs-chart__title">Implant consultations booked per month · [placeholder bars]</span>
                <div className="cs-chart__bars" role="img" aria-label="Placeholder bar chart of monthly implant consultations; to be replaced with verified data">
                  {BARS.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
                </div>
                <div className="cs-chart__axis"><span>Month 1</span><span>Month 6</span><span>Month 12</span></div>
              </div>
              <figcaption>Replace with verified monthly data from the client’s call tracking and practice management system.</figcaption>
            </figure>

            <blockquote className="cs-quote">
              <span className="cs-quote__text">“[Verified quote from the practice owner about the experience and results.]”</span>
              <span className="cs-quote__by">— [Dr. Name, DDS], [Practice name]</span>
            </blockquote>

            <div className="cs-takeaways">
              <h2 className="cs-takeaways__h">Key takeaways for implant practices</h2>
              <ul>
                {TAKEAWAYS.map((t) => <li key={t}><CheckIcon />{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="cs-more-h" className="cs-more">
        <div className="container stack gap-28">
          <h2 id="cs-more-h" className="cs-more__h">More client stories</h2>
          <div className="cs-more__grid">
            {MORE.map((m) => (
              <article key={m.tag} className="cs-story-card">
                <PhotoSlot label={m.alt} tag={m.tag} ratio="16 / 9" />
                <div className="cs-story-card__body">
                  <h3>{m.t}</h3>
                  <span className="cs-story-card__soon">Story coming soon</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
