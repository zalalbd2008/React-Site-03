import { useMemo, useState } from 'react';
import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd, serviceJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import Button from '../components/ui/Button.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import { PATHS } from '../config/site.js';
import { findService } from '../data/services.js';
import './SpecialtyImplants.css';

const CRUMBS = [
  { label: 'Home', to: PATHS.home },
  { label: 'Specialties', to: PATHS.specialties },
  { label: 'Dental Implants' },
];

const JOURNEY = [
  { n: 'STAGE 1', t: 'Discovery', b: 'Searches like “dental implants cost” and “implants vs dentures.”', ch: 'SEO · educational guides' },
  { n: 'STAGE 2', t: 'Comparison', b: 'Reads reviews, watches videos, compares providers nearby.', ch: 'Reputation · video · Local SEO' },
  { n: 'STAGE 3', t: 'Financing', b: 'Needs clear payment options before committing to a visit.', ch: 'Financing page · retargeting' },
  { n: 'STAGE 4', t: 'Consultation', b: 'Ready to talk — the booking path has to be effortless.', ch: 'Google Ads · CRO · call tracking', dark: true },
  { n: 'STAGE 5', t: 'Follow-up', b: 'Many patients don’t accept on day one. Nurture matters.', ch: 'Email · SMS reminders' },
];

const PERSONAS = [
  { t: 'The single-tooth replacer', w: 'Cost, pain and whether it’s worth it versus a bridge.', m: 'Clear cost ranges, a step-by-step timeline, comfort and sedation options.', alt: 'Professional in her 40s pointing to a missing molar during a consultation' },
  { t: 'The full-arch candidate', w: 'Years of embarrassment, fear of surgery and total investment.', m: 'Life-after stories (with consent), financing, a doctor-led consultation.', alt: 'Retired couple laughing together over dinner' },
  { t: 'The denture wearer', w: 'Slipping dentures, eating limits, whether they qualify.', m: 'Implant-retained denture options, candidacy checklist, free CT scan offer [if offered].', alt: 'Man in his 60s biting into an apple confidently' },
];

const MIX = [
  { n: '01', t: 'Implant-focused SEO', b: 'Cost, candidacy and full-arch pages that rank and educate.', slug: 'dental-seo' },
  { n: '02', t: 'Google Ads by procedure', b: 'Separate campaigns for single implants and full-arch.', slug: 'google-ads' },
  { n: '03', t: 'Reputation management', b: 'Reviews that mention implant experiences specifically.', slug: 'reputation' },
  { n: '04', t: 'Consultation CRO', b: 'Booking, financing and follow-up built for long decisions.', slug: 'cro' },
].map((m) => ({ ...m, href: findService(m.slug)?.href || PATHS.services }));

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const SLIDERS = [
  { key: 'consults', id: 'spec-c1', label: 'Extra consultations per month', min: 1, max: 20, step: 1, fmt: (v) => String(v), unit: (v) => `${v} consultations` },
  { key: 'close', id: 'spec-c2', label: 'Your case acceptance rate', min: 10, max: 90, step: 5, fmt: (v) => `${v}%`, unit: (v) => `${v} percent` },
  { key: 'value', id: 'spec-c3', label: 'Average implant case value', min: 3000, max: 60000, step: 1000, fmt: (v) => usd.format(v), unit: (v) => usd.format(v) },
];

function OpportunityCalculator() {
  const [vals, setVals] = useState({ consults: 4, close: 50, value: 20000 });

  const result = useMemo(() => {
    const cases = (vals.consults * vals.close) / 100;
    return { cases, monthly: cases * vals.value, annual: cases * vals.value * 12 };
  }, [vals]);

  const set = (s) => (e) => {
    const n = Number(e.target.value);
    if (!Number.isFinite(n)) return;
    setVals((v) => ({ ...v, [s.key]: Math.min(s.max, Math.max(s.min, n)) }));
  };

  return (
    <div className="spec-calc">
      <div className="stack gap-24">
        <span className="eyebrow">OPPORTUNITY CALCULATOR</span>
        <h2 id="spec-calc-h" className="h2 spec-h2">What would a few more consultations a month be worth?</h2>
        <p className="spec-calc__note">Enter your own numbers. This is simple arithmetic, not a forecast or a promise of results.</p>
        {SLIDERS.map((s) => (
          <div key={s.key} className="spec-slider">
            <div className="spec-slider__row">
              <label htmlFor={s.id}>{s.label}</label>
              <output htmlFor={s.id} className="spec-slider__val">{s.fmt(vals[s.key])}</output>
            </div>
            <input
              id={s.id} type="range" min={s.min} max={s.max} step={s.step} value={vals[s.key]}
              aria-valuetext={s.unit(vals[s.key])} onChange={set(s)}
              style={{ '--spec-fill': `${((vals[s.key] - s.min) / (s.max - s.min)) * 100}%` }}
            />
            <div className="spec-slider__range" aria-hidden="true"><span>{s.fmt(s.min)}</span><span>{s.fmt(s.max)}</span></div>
          </div>
        ))}
      </div>

      <div className="spec-result" aria-labelledby="spec-result-h">
        <span id="spec-result-h" className="eyebrow eyebrow--peach">YOUR ESTIMATE</span>
        <div aria-live="polite" aria-atomic="true">
          <div className="spec-result__big">{usd.format(result.annual)}</div>
          <div className="small">potential added production per year</div>
        </div>
        <div className="spec-result__grid">
          <div><div className="spec-result__num">{oneDecimal.format(result.cases)}</div><div className="spec-result__l">new cases / month</div></div>
          <div><div className="spec-result__num">{usd.format(result.monthly)}</div><div className="spec-result__l">production / month</div></div>
        </div>
        <Button to={`${PATHS.freeAudit}?focus=implants`} block>See how to get there →</Button>
      </div>
    </div>
  );
}

const DESCRIPTION = 'Marketing for implant practices: search visibility, honest education, financing clarity and follow-up that turns long research into booked consultations.';

export default function SpecialtyImplants() {
  return (
    <div className="spec">
      <Seo
        title="Dental Implant Marketing"
        description={DESCRIPTION}
        jsonLd={[
          serviceJsonLd({ name: 'Dental implant practice marketing', description: DESCRIPTION, path: PATHS.implants, serviceType: 'Marketing for dental implant practices' }),
          breadcrumbJsonLd(CRUMBS),
        ]}
      />

      <section aria-labelledby="spec-h1" className="spec-hero-wrap">
        <div className="spec-hero">
          <PhotoSlot
            label="Smiling older patient after dental implant treatment, sitting with her implant dentist"
            tag="PHOTO · FULL-BLEED" className="spec-hero__photo"
          />
          <div className="spec-hero__shade" aria-hidden="true" />
          <div className="spec-hero__copy">
            <Breadcrumbs items={CRUMBS} dark />
            <span className="eyebrow eyebrow--peach">SPECIALTY MARKETING · DENTAL IMPLANTS</span>
            <h1 id="spec-h1" className="spec-hero__title">Marketing for implant practices that turns months of research into booked consultations</h1>
            <p className="spec-hero__lead">Implant patients compare, worry and save before they commit. We meet them at every step — with search visibility, honest education, financing clarity and follow-up that doesn’t let qualified leads go cold.</p>
            <div className="spec-actions">
              <Button to={`${PATHS.freeAudit}?focus=implants`}>Get an Implant Marketing Audit</Button>
              <a href="#calc" className="btn btn--lg spec-btn-ghost">Estimate your opportunity</a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="spec-jr-h" className="section">
        <div className="container stack gap-48">
          <div className="spec-intro">
            <div className="stack gap-16">
              <span className="eyebrow">THE IMPLANT PATIENT JOURNEY</span>
              <h2 id="spec-jr-h" className="h2 spec-h2">A long decision deserves a deliberate marketing path</h2>
            </div>
            <p className="spec-body-lg">Single-tooth and full-arch patients may research for weeks or months. Practices that win show up early, answer cost questions honestly and stay present until the patient is ready.</p>
          </div>
          <ol className="spec-journey">
            {JOURNEY.map((j) => (
              <li key={j.n} className={j.dark ? 'is-dark' : undefined}>
                <span className="spec-journey__n">{j.n}</span>
                <h3>{j.t}</h3>
                <p>{j.b}</p>
                <span className="spec-journey__ch">{j.ch}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="spec-per-h" className="section section--alt">
        <div className="container stack gap-40">
          <h2 id="spec-per-h" className="h2 spec-h2 spec-maxw">Three implant patients, three different messages</h2>
          <div className="spec-personas">
            {PERSONAS.map((p) => (
              <article key={p.t} className="spec-persona">
                <PhotoSlot label={p.alt} tag="PHOTO" cap={p.alt} ratio="16 / 10" />
                <div className="spec-persona__body">
                  <h3>{p.t}</h3>
                  <p><strong>Worries about: </strong>{p.w}</p>
                  <p><strong>We lead with: </strong>{p.m}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calc" aria-labelledby="spec-calc-h" className="section spec-calc-section">
        <div className="container">
          <OpportunityCalculator />
        </div>
      </section>

      <section aria-labelledby="spec-mix-h" className="section section--warm">
        <div className="container spec-mix">
          <div className="stack spec-gap-18">
            <span className="eyebrow">RECOMMENDED SERVICES</span>
            <h2 id="spec-mix-h" className="h2 spec-h2">The channel mix we typically start implant practices with</h2>
            <p>Every plan is built from your audit; this is the usual starting point, not a fixed package.</p>
          </div>
          <div className="stack spec-gap-14">
            {MIX.map((m) => (
              <AppLink key={m.n} to={m.href} className="spec-mix__item">
                <span className="spec-mix__n" aria-hidden="true">{m.n}</span>
                <span className="stack spec-gap-2">
                  <span className="spec-mix__t">{m.t}</span>
                  <span className="spec-mix__b">{m.b}</span>
                </span>
                <span aria-hidden="true" className="spec-mix__arrow">→</span>
              </AppLink>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="spec-tq-h" className="section">
        <figure className="spec-quote">
          <h2 id="spec-tq-h" className="eyebrow">FROM AN IMPLANT PRACTICE</h2>
          <blockquote>“[Verified testimonial from an implant-focused client, used with written permission.]”</blockquote>
          <figcaption><strong>[Dr. Name, DDS]</strong> · [Practice · City, State]</figcaption>
        </figure>
      </section>
    </div>
  );
}
