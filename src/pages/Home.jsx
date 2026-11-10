import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import Seo from '../components/seo/Seo.jsx';
import { organizationJsonLd, websiteJsonLd, faqJsonLd } from '../components/seo/jsonld.js';
import Button from '../components/ui/Button.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import { CheckIcon, PathIcon, PlayIcon } from '../components/ui/Icons.jsx';
import { Field, Honeypot, FormAlert } from '../components/forms/Field.jsx';
import { useLeadForm } from '../hooks/useLeadForm.js';
import { rules, isPhone, normalizeWebsite, clean } from '../utils/validation.js';
import { PATHS, PILLAR_SLUG } from '../config/site.js';
import { SERVICE_GROUPS } from '../data/services.js';
import { SPECIALTIES } from '../data/specialties.js';
import './Home.css';

/* ---------------- Content (verbatim from the Homepage artboard) ---------------- */

const MAP_PACK = [
  { n: '1', t: '[Your Practice]', me: true },
  { n: '2', t: 'Competitor A' },
  { n: '3', t: 'Competitor B' },
];

const PLATFORMS = ['Google Ads', 'Google Business Profile', 'Google Analytics 4', 'Meta Ads', 'WordPress', 'React / Next.js'];

const INTRO_POINTS = [
  'Strategists who know the difference between a hygiene recall and a full-arch case',
  'Campaigns organized by procedure value, not by channel',
  'One dashboard: calls, forms, bookings and cost per new patient',
];

const CHALLENGES = [
  { n: '01', t: 'Invisible in the map pack', b: 'If you’re not in Google’s top three local results, most nearby searchers never see you at all.', f: 'Local SEO, profile optimization and review velocity.' },
  { n: '02', t: 'Ad spend with no clear return', b: 'Broad campaigns pull in job seekers, price shoppers and out-of-area clicks.', f: 'Procedure-level campaigns and call tracking.' },
  { n: '03', t: 'A website that doesn’t book', b: 'Slow pages, buried phone numbers and no online booking quietly lose ready-to-book patients.', f: 'Conversion-first design and testing.' },
  { n: '04', t: 'Reviews that lag the competition', b: 'Patients compare star ratings and recency before they ever call.', f: 'Automated, compliant review generation.' },
];

const GROUPS = [
  { name: 'Get Found', items: [
    { t: 'Dental SEO', b: 'Treatment-page SEO, technical fixes and authority building that rank you for high-value procedures.', icon: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.5-4.5' },
    { t: 'Local SEO', b: 'Map-pack visibility across every neighborhood you serve, tracked on a local rank grid.', icon: 'M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12zM12 11a2 2 0 100-4 2 2 0 000 4z' },
    { t: 'Google Business Profile', b: 'Categories, services, photos, posts and Q&A tuned to the searches that bring patients.', icon: 'M4 7h16v13H4zM8 7V4h8v3M9 13h6' },
    { t: 'AI Search Optimization', b: 'Structured, consistent practice information that AI assistants can cite with confidence.', icon: 'M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z' } ] },
  { name: 'Get Chosen', items: [
    { t: 'Google Ads & PPC', b: 'Campaigns segmented by procedure value with call tracking and cost-per-new-patient reporting.', icon: 'M3 3v18h18M7 15l4-4 3 3 6-7' },
    { t: 'Social Media Marketing', b: 'Team-forward content and local ads that make your practice familiar before the first visit.', icon: 'M7 10a3 3 0 100-6 3 3 0 000 6zM17 20a3 3 0 100-6 3 3 0 000 6zM9.5 8.5l5 7' },
    { t: 'Reputation Management', b: 'Automated review requests, HIPAA-mindful reply templates and rating monitoring.', icon: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z' },
    { t: 'Content Marketing', b: 'Treatment explainers, FAQs and guides that answer real patient questions in plain language.', icon: 'M4 5h16M4 10h16M4 15h10M4 20h7' } ] },
  { name: 'Get Booked', items: [
    { t: 'Dental Website Design', b: 'Premium, fast websites with clear treatment paths and accessible, mobile-first layouts.', icon: 'M3 5h18v12H3zM8 21h8M12 17v4' },
    { t: 'Website Development', b: 'Online booking, forms, analytics and practice-software integrations built properly.', icon: 'M8 8l-5 4 5 4M16 8l5 4-5 4M14 4l-4 16' },
    { t: 'Conversion Optimization', b: 'Testing calls-to-action, forms and page flow to turn more visitors into booked visits.', icon: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 8a4 4 0 110 8 4 4 0 010-8z' },
    { t: 'Practice Growth Strategy', b: 'A single quarterly plan and budget across every channel, tied to production goals.', icon: 'M4 20h16M6 16l4-4 3 3 5-6M18 9h-3M18 9v3' } ] },
].map((g, gi) => ({ ...g, items: g.items.map((it, ii) => ({ ...it, href: SERVICE_GROUPS[gi]?.items[ii]?.href || PATHS.services })) }));

const FEATURES = [
  { tag: 'DASHBOARD MOCKUP', alt: 'SEO dashboard mockup showing treatment keywords climbing in rankings for an implant practice', eyebrow: 'DENTAL SEO', h: 'Rank for the treatments that grow production — not just “dentist near me”', p: 'We map keywords to the procedures you want more of, build treatment pages that answer every patient question, and fix the technical issues holding your site back.', pts: ['Procedure-level keyword strategy', 'Technical and speed audits', 'Treatment and location pages', 'Authority and link building'], cta: 'Explore Dental SEO', to: PATHS.dentalSeo },
  { reverse: true, tag: 'ADS MOCKUP', alt: 'Google Ads campaign view split by procedure: implants, Invisalign, emergency and new-patient exams', eyebrow: 'GOOGLE ADS FOR DENTISTS', h: 'Paid search that answers to one number: cost per new patient', p: 'Campaigns segmented by procedure value, tight geographic targeting and negative keyword lists built for dental — with every call recorded and attributed.', pts: ['Procedure-segmented campaigns', 'Call tracking and recording', 'Landing pages per treatment', 'Monthly budget reallocation'], cta: 'Explore Google Ads', to: `${PATHS.services}#google-ads` },
  { tag: 'WEBSITE MOCKUP', alt: 'Premium dental website shown on laptop and phone with a clear Book Online button', eyebrow: 'DENTAL WEBSITE DESIGN', h: 'Websites that feel as premium as the care you provide', p: 'Fast, accessible, mobile-first sites with real team photography, clear treatment paths and booking built into every page.', pts: ['Custom design, no templates', 'Online booking integration', 'Accessibility-minded build', 'Core Web Vitals optimized'], cta: 'Explore Website Design', to: `${PATHS.services}#website-design` },
];

const STAGES = [
  { n: '1', t: 'Visibility', b: 'Show up where patients search: Google, maps, social and AI assistants.', ch: 'SEO · Local · AI Search' },
  { n: '2', t: 'Trust', b: 'Win the comparison with reviews, real photos and clear expertise.', ch: 'Reputation · Content' },
  { n: '3', t: 'Conversion', b: 'Make it effortless to call, message or book online.', ch: 'Website · CRO' },
  { n: '4', t: 'Acceleration', b: 'Add paid reach for high-value procedures when the math works.', ch: 'Google Ads · Social Ads', tone: 'orange' },
  { n: '5', t: 'Measurement', b: 'Attribute every new patient and reinvest in what works.', ch: 'Tracking · Reporting', tone: 'teal' },
];

const COMPARE = [
  { k: 'Industry focus', a: 'Dental practices only', b: 'Dozens of industries' },
  { k: 'Success metric', a: 'New patients and cost per new patient', b: 'Clicks, impressions, traffic' },
  { k: 'Campaign structure', a: 'By procedure and production value', b: 'By channel' },
  { k: 'Compliance', a: 'HIPAA-mindful forms and tracking', b: 'Generic lead forms' },
  { k: 'Your point of contact', a: 'A dedicated dental strategist', b: 'Rotating account managers' },
  { k: 'Reporting', a: 'Live dashboard + monthly strategy call', b: 'Monthly PDF' },
];

const PROCESS = [
  { n: '1', t: 'Audit', when: 'WEEK 1', b: 'We benchmark your visibility, website, reviews and ads against the practices you compete with.' },
  { n: '2', t: 'Plan', when: 'WEEK 2', b: 'A 90-day roadmap with priorities, budget and the new-patient targets we’re aiming for.' },
  { n: '3', t: 'Launch', when: 'WEEKS 3–6', b: 'Tracking first, then fixes, content, campaigns and profile optimization go live.' },
  { n: '4', t: 'Optimize', when: 'ONGOING', b: 'Monthly strategy calls, budget reallocation and new opportunities as you grow.' },
];

const STATS = [
  { v: '[00]%', l: 'Average increase in new-patient calls in year one [verify]' },
  { v: '[$000]', l: 'Average cost per new patient from Google Ads [verify]' },
  { v: '[000]+', l: 'Dental practices served [verify]' },
  { v: '[0.0]★', l: 'Average client Google rating after 12 months [verify]' },
];

const CASES = [
  { tag: 'DENTAL IMPLANTS · [CITY, STATE]', t: '[Practice name]: building a predictable implant consultation pipeline', b: '[Summary of challenge, strategy and verified outcome.]', alt: 'Implant dentist explaining a treatment model to a patient' },
  { tag: 'MULTI-LOCATION · [CITY, STATE]', t: '[Group name]: winning the map pack across [0] locations', b: '[Summary of challenge, strategy and verified outcome.]', alt: 'Dental group team photo outside a modern clinic' },
];

const SPECIALTY_BLURBS = [
  'Fill hygiene schedules and build lifelong families of patients.',
  'Attract veneer and whitening cases with before-and-after-led content.',
  'Reach parents and adults researching clear aligners and braces.',
  'Earn parents’ trust with warm, reassuring messaging.',
  'Nurture long research cycles into booked consultations.',
  'Grow referrals and direct gum-health inquiries.',
  'Capture urgent root-canal searches and referring-dentist trust.',
  'Wisdom teeth, implants and full-arch cases, by procedure.',
  'Scale consistent visibility and reporting across every office.',
];

const GRID = '22211002221110222110122110011110001'.split('');

const POSTS_PREVIEW = [
  { cat: 'GOOGLE ADS', t: 'Dental Google Ads: How to Structure Campaigns by Procedure Value', time: '12 min read', alt: 'Ads campaign illustration', slug: 'google-ads-by-procedure-value' },
  { cat: 'REPUTATION', t: 'How to Ask Every Patient for a Review — Without Breaking HIPAA', time: '8 min read', alt: 'Review request illustration', slug: 'reviews-without-privacy-risk' },
  { cat: 'AI SEARCH', t: 'What Google’s AI Overviews Mean for Your Practice’s Visibility', time: '10 min read', alt: 'AI search illustration', slug: 'ai-overviews-dental-visibility' },
  { cat: 'WEBSITES', t: '11 Things Every Dental Homepage Needs Above the Fold', time: '7 min read', alt: 'Website wireframe illustration', slug: 'dental-homepage-above-the-fold' },
];

const QUOTES = [
  { text: '[Verified client testimonial goes here — a specific, attributable quote about results or partnership, used with written permission.]', name: '[Dr. Client Name, DDS]', role: '[Practice name · City, State]' },
  { text: '[Second verified testimonial — ideally from a different specialty, e.g. an orthodontist or implant practice.]', name: '[Dr. Client Name, DMD]', role: '[Practice name · City, State]' },
  { text: '[Third verified testimonial — ideally from a practice manager or multi-location group.]', name: '[Client Name]', role: '[Role · Group name]' },
];

const FAQS = [
  { q: 'Do you only work with dental practices?', a: 'Yes. Every strategist, writer and ad specialist on our team works exclusively on dental marketing, so you never pay for us to learn your industry.' },
  { q: 'How long until we see more new patients?', a: 'Paid search can produce calls within the first few weeks of launch. SEO and local visibility typically build over several months. Your audit includes a realistic timeline for your market and competition.' },
  { q: 'Are there long-term contracts?', a: '[Confirm contract terms — e.g. month-to-month after an initial onboarding period.]' },
  { q: 'How do you measure success?', a: 'We track calls, forms and online bookings back to the channel that produced them, and report on new patients and cost per new patient — not just traffic.' },
  { q: 'Is your work HIPAA-mindful?', a: 'We design forms and tracking to avoid collecting protected health information and follow your practice’s compliance requirements. We’ll review your specific setup during onboarding.' },
  { q: 'Can you work with our existing website?', a: 'Often, yes. We start with an audit and only recommend a rebuild when the current site is genuinely holding back rankings or conversions.' },
];

/* ---------------- Sections ---------------- */

function HeroAuditForm() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (rules.website(url)) { setError(true); return; }
    navigate(`${PATHS.freeAudit}?site=${encodeURIComponent(normalizeWebsite(url))}`);
  };

  return (
    <form className="home-hero__form" onSubmit={onSubmit} noValidate>
      <div className={`home-hero__field${error ? ' is-invalid' : ''}`}>
        <label htmlFor="hero-site" className="sr-only">Your practice website</label>
        <input
          id="hero-site" type="url" inputMode="url" autoComplete="url" placeholder="yourpractice.com"
          value={url} onChange={(e) => { setUrl(e.target.value); setError(false); }}
          aria-describedby="hero-msg" aria-invalid={error ? 'true' : 'false'}
        />
        <Button type="submit" size="lg" className="home-hero__submit">Get My Free Audit</Button>
      </div>
      <p id="hero-msg" role="status" className={`home-hero__msg${error ? ' is-error' : ''}`}>
        {error ? 'Please enter your practice website, e.g. smilesofaustin.com' : 'Free · Takes about 60 seconds · No credit card'}
      </p>
    </form>
  );
}

function ServiceTabs() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef([]);
  const baseId = useId();

  const onKeyDown = (e) => {
    const last = GROUPS.length - 1;
    let next = null;
    if (e.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    else if (e.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <>
      <div role="tablist" aria-label="Service groups" className="home-tabs" onKeyDown={onKeyDown}>
        {GROUPS.map((g, i) => {
          const on = i === active;
          return (
            <button
              key={g.name} type="button" role="tab" id={`${baseId}-tab-${i}`}
              aria-selected={on} aria-controls={`${baseId}-panel-${i}`} tabIndex={on ? 0 : -1}
              ref={(el) => { tabsRef.current[i] = el; }}
              className={`home-tab${on ? ' is-active' : ''}`} onClick={() => setActive(i)}
            >
              <span className="home-tab__num">0{i + 1}</span>{g.name}
            </button>
          );
        })}
      </div>
      {GROUPS.map((g, i) => (
        <div
          key={g.name} role="tabpanel" id={`${baseId}-panel-${i}`} aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active} className="home-svc-grid"
        >
          {g.items.map((s) => (
            <AppLink key={s.t} to={s.href} className="home-svc lift">
              <span className="home-svc__icon"><PathIcon d={s.icon} color="var(--c-cta)" /></span>
              <h3 className="home-svc__t">{s.t}</h3>
              <p className="home-svc__b">{s.b}</p>
              <span className="home-svc__cta">Explore {s.t} →</span>
            </AppLink>
          ))}
        </div>
      ))}
    </>
  );
}

function Testimonials() {
  const [q, setQ] = useState(0);
  const quote = QUOTES[q];
  const n = QUOTES.length;
  return (
    <section aria-labelledby="ts-h" className="home-quotes">
      <div className="home-quotes__inner">
        <span className="eyebrow">WHAT PRACTICE OWNERS SAY</span>
        <h2 id="ts-h" className="sr-only">Testimonials</h2>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--c-ember)" aria-hidden="true"><path d="M4 18v-5a6 6 0 016-6v3a3 3 0 00-3 3h3v5H4zm10 0v-5a6 6 0 016-6v3a3 3 0 00-3 3h3v5h-6z" /></svg>
        <figure className="home-quotes__fig" aria-live="polite">
          <blockquote className="home-quotes__text" key={q}>{quote.text}</blockquote>
          <figcaption className="home-quotes__who">
            <PhotoSlot className="home-quotes__avatar ph--round" label="Portrait of the client dentist" />
            <span><span className="home-quotes__name">{quote.name}</span><span className="home-quotes__role">{quote.role}</span></span>
          </figcaption>
        </figure>
        <div className="home-quotes__nav">
          <button type="button" className="home-quotes__btn" aria-label="Previous testimonial" onClick={() => setQ((q + n - 1) % n)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <span className="home-quotes__pos">{q + 1} / {n}</span>
          <button type="button" className="home-quotes__btn home-quotes__btn--solid" aria-label="Next testimonial" onClick={() => setQ((q + 1) % n)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function HomeFaq() {
  const [open, setOpen] = useState(0);
  const baseId = useId();
  return (
    <div className="home-faq">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="home-faq__item">
            <h3 className="home-faq__q">
              <button type="button" id={`${baseId}-q${i}`} aria-expanded={isOpen} aria-controls={`${baseId}-a${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{f.q}</span>
                <span aria-hidden="true" className={`home-faq__icon${isOpen ? ' is-open' : ''}`}>+</span>
              </button>
            </h3>
            <div id={`${baseId}-a${i}`} role="region" aria-labelledby={`${baseId}-q${i}`} hidden={!isOpen}>
              <p className="home-faq__a">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CONSULT_INITIAL = { name: '', email: '', phone: '', practice: '' };
const CONSULT_VALIDATORS = {
  name: rules.name,
  email: (v) => (rules.email(v) ? 'Enter a valid email, e.g. you@practice.com.' : ''),
  phone: (v) => (isPhone(v) ? '' : 'Enter a 10-digit phone number.'),
  practice: (v) => (clean(v) ? '' : 'Enter your practice name or website.'),
};

function ConsultForm() {
  const navigate = useNavigate();
  const onSuccess = useCallback(() => navigate(PATHS.thankYou), [navigate]);
  const serialize = useCallback((v) => ({ ...v, interest: 'Homepage free consultation' }), []);
  const form = useLeadForm({ initial: CONSULT_INITIAL, validators: CONSULT_VALIDATORS, formType: 'consultation', serialize, onSuccess });

  return (
    <form className="home-consult__form" onSubmit={form.submit} noValidate>
      <Honeypot {...form.honeypotProps} />
      <Field id="cf-name" label="Your name" type="text" autoComplete="name" placeholder="Dr. Jane Smith" error={form.errorFor('name')} {...form.field('name')} />
      <Field id="cf-email" label="Work email" type="email" autoComplete="email" placeholder="jane@smithdental.com" error={form.errorFor('email')} {...form.field('email')} />
      <Field id="cf-phone" label="Phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567" error={form.errorFor('phone')} {...form.field('phone')} />
      <Field id="cf-practice" label="Practice name or website" type="text" autoComplete="organization" placeholder="Smith Family Dental" error={form.errorFor('practice')} {...form.field('practice')} />
      <FormAlert>{form.serverError}</FormAlert>
      <Button type="submit" block loading={form.submitting} className="home-consult__submit">
        {form.submitting ? 'Sending…' : 'Book My Free Consultation'}
      </Button>
      <p className="form-note">We’ll never share your details. Please don’t include patient health information.</p>
    </form>
  );
}

const NEWS_VALIDATORS = { email: rules.email };
const NEWS_INITIAL = { email: '' };

function Newsletter() {
  const form = useLeadForm({ initial: NEWS_INITIAL, validators: NEWS_VALIDATORS, formType: 'newsletter' });
  const err = form.errorFor('email');
  return (
    <section aria-labelledby="nl-h" className="home-news">
      <div className="home-news__inner">
        <div className="home-news__copy">
          <h2 id="nl-h" className="home-news__title">The Chairside Growth Brief</h2>
          <p>One practical dental marketing idea every Tuesday. Five-minute read, unsubscribe anytime.</p>
        </div>
        {form.status === 'success' ? (
          <p role="status" className="home-news__ok"><CheckIcon size={20} /> You’re subscribed — look for the first brief next Tuesday.</p>
        ) : (
          <form className="home-news__form" onSubmit={form.submit} noValidate>
            <Honeypot {...form.honeypotProps} />
            <div className="home-news__row">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input
                id="nl-email" type="email" autoComplete="email" placeholder="you@yourpractice.com"
                className={`field__control home-news__input${err ? ' is-invalid' : ''}`}
                aria-invalid={err ? 'true' : 'false'} aria-describedby={err ? 'nl-err' : undefined}
                {...form.field('email')}
              />
              <Button type="submit" variant="navy" size="md" loading={form.submitting} className="home-news__btn">Subscribe</Button>
            </div>
            {err ? <span id="nl-err" className="field__error">{err}</span> : null}
            <FormAlert>{form.serverError}</FormAlert>
          </form>
        )}
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default function Home() {
  const jsonLd = useMemo(() => [organizationJsonLd(), websiteJsonLd(), faqJsonLd(FAQS)], []);

  return (
    <div className="home">
      <Seo
        title="Dental Marketing Agency — SEO, Google Ads & Websites for Dentists"
        description="Alpha Dental Media helps dental practices rank higher on Google, win the map pack and turn website visitors into booked appointments — with reporting tied to new patients."
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section aria-labelledby="hero-h" className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__copy home-rise">
            <span className="eyebrow">DENTAL MARKETING AGENCY · SEO · ADS · WEBSITES</span>
            <h1 id="hero-h" className="h1">More new patients. <span className="accent">Fewer empty chairs.</span></h1>
            <p className="lead home-hero__lead">Alpha Dental Media helps dental practices rank higher on Google, win more of the map pack and turn website visitors into booked appointments — with reporting tied to new patients, not vanity metrics.</p>
            <HeroAuditForm />
            <div className="home-hero__talk">
              <AppLink to={PATHS.contact} className="home-hero__talk-link">
                <span className="home-hero__play"><PlayIcon /></span>Talk to a dental marketing expert
              </AppLink>
              <span className="home-hero__talk-note">No contracts on the call · Reply within 1 business day</span>
            </div>
          </div>
          <div className="home-hero__visual home-rise">
            <PhotoSlot
              className="home-hero__photo"
              label="Dentist reviewing a smile treatment plan with a patient in a bright modern operatory"
              tag="PHOTO · HERO"
              cap="Dentist and patient reviewing a treatment plan on a tablet in a bright, modern operatory. Natural light, warm skin tones, shallow depth of field."
            />
            <div className="home-hero__mappack">
              <span className="home-hero__card-eyebrow">GOOGLE MAP PACK · SAMPLE</span>
              {MAP_PACK.map((p) => (
                <div key={p.n} className="home-hero__mp-row">
                  <span className={`home-hero__mp-dot${p.me ? ' is-me' : ''}`}>{p.n}</span>
                  <span className={p.me ? 'is-me' : ''}>{p.t}</span>
                </div>
              ))}
            </div>
            <div className="home-hero__trend">
              <span className="home-hero__card-eyebrow home-hero__card-eyebrow--peach">NEW-PATIENT CALLS · ILLUSTRATIVE</span>
              <svg viewBox="0 0 240 64" width="100%" height="64" role="img" aria-label="Illustrative upward trend line" preserveAspectRatio="none">
                <path d="M0 56 L30 50 L60 52 L90 40 L120 42 L150 30 L180 24 L210 14 L240 6" fill="none" stroke="var(--c-coral)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="home-hero__trend-note">Tracked calls, forms and bookings in one live dashboard.</span>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section aria-label="Platforms and client logos" className="home-platforms">
        <div className="home-platforms__inner">
          <p className="home-platforms__label">THE PLATFORMS WE MANAGE FOR DENTAL PRACTICES</p>
          <ul className="home-platforms__grid">
            {PLATFORMS.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <p className="caption">[Client practice logos appear here once client permission is confirmed.]</p>
        </div>
      </section>

      {/* INTRO */}
      <section aria-labelledby="intro-h" className="home-intro">
        <div className="home-intro__inner">
          <div className="home-intro__media">
            <PhotoSlot className="home-intro__tall" label="Dental front-desk coordinator welcoming a new patient" tag="PHOTO" cap="Front-desk coordinator greeting a new patient" />
            <div className="home-intro__stack">
              <PhotoSlot className="home-intro__square" label="Clean, modern dental practice reception area" tag="PHOTO" cap="Modern reception interior" />
              <div className="home-intro__stat">
                <span className="home-intro__stat-v">100%</span>
                <span>of our focus is dental. No restaurants, no roofers — just practices like yours.</span>
              </div>
            </div>
          </div>
          <div className="home-intro__copy">
            <span className="eyebrow">WHO WE ARE</span>
            <h2 id="intro-h" className="h2">A marketing team that speaks fluent dentistry</h2>
            <p className="home-body-lg">Patients don’t search for “dentist” the way they search for anything else. They search for relief, for confidence, for someone they can trust with their family. We build marketing around those moments — from the emergency toothache search at 10 p.m. to the months-long research behind a full-arch implant case.</p>
            <p className="home-body-lg">That focus shapes everything: the keywords we target, the way we write treatment pages, how we structure ad campaigns by procedure value, and how we measure success — in booked appointments and production, not impressions.</p>
            <ul className="checklist home-intro__points">
              {INTRO_POINTS.map((p) => <li key={p}><CheckIcon size={22} />{p}</li>)}
            </ul>
            <AppLink to={`${PATHS.about}#approach`} className="link-arrow home-intro__more">More about our approach →</AppLink>
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section aria-labelledby="ch-h" className="home-problem">
        <div className="container stack gap-56">
          <div className="home-split">
            <div className="stack gap-16">
              <span className="eyebrow eyebrow--peach">THE PROBLEM</span>
              <h2 id="ch-h" className="h2 on-dark">Great dentistry doesn’t fill a schedule on its own</h2>
            </div>
            <p className="home-body-lg">Most practices we talk to aren’t short on skill. They’re losing patients to competitors who are simply easier to find, easier to trust and easier to book.</p>
          </div>
          <div className="home-problem__grid">
            {CHALLENGES.map((c) => (
              <article key={c.n} className="home-problem__card">
                <span className="home-problem__n">{c.n}</span>
                <h3 className="home-problem__t">{c.t}</h3>
                <p className="home-problem__b">{c.b}</p>
                <p className="home-problem__fix"><strong>The fix: </strong>{c.f}</p>
              </article>
            ))}
          </div>
          <span className="home-problem__swipe" aria-hidden="true">Swipe for more →</span>
        </div>
      </section>

      {/* SERVICES (tabs) */}
      <section aria-labelledby="sv-h" className="home-services">
        <div className="container stack gap-40">
          <div className="home-center-head">
            <span className="eyebrow">PROPOSED SERVICES</span>
            <h2 id="sv-h" className="h2">Everything a practice needs to get found, chosen and booked</h2>
            <p className="home-body-lg">Pick one channel or let us run the full growth system. Every service reports into the same new-patient dashboard.</p>
          </div>
          <ServiceTabs />
        </div>
      </section>

      {/* FEATURE ROWS */}
      <section aria-label="Core services in depth" className="home-features">
        {FEATURES.map((ft) => (
          <div key={ft.eyebrow} className={`home-feature${ft.reverse ? ' home-feature--reverse' : ''}`}>
            <div className="home-feature__media">
              <PhotoSlot className="home-feature__photo" label={ft.alt} tag={ft.tag} cap={ft.alt} />
            </div>
            <div className="home-feature__copy">
              <span className="eyebrow eyebrow--teal">{ft.eyebrow}</span>
              <h2 className="home-feature__h">{ft.h}</h2>
              <p className="home-body-lg">{ft.p}</p>
              <ul className="home-feature__pts">
                {ft.pts.map((pt) => <li key={pt}><CheckIcon color="var(--c-cta)" />{pt}</li>)}
              </ul>
              <Button to={ft.to} variant="outline" size="md" className="home-feature__cta">{ft.cta}</Button>
            </div>
          </div>
        ))}
      </section>

      {/* GROWTH SYSTEM */}
      <section aria-labelledby="gs-h" className="home-growth">
        <div className="container stack gap-48">
          <div className="stack gap-16 home-growth__head">
            <span className="eyebrow">THE ALPHA GROWTH SYSTEM</span>
            <h2 id="gs-h" className="h2">Five stages every new patient moves through — and how we strengthen each one</h2>
          </div>
          <ol className="home-growth__list">
            {STAGES.map((st) => (
              <li key={st.n} className="home-growth__stage">
                <div className="home-growth__track">
                  <span className={`home-growth__n${st.tone ? ` home-growth__n--${st.tone}` : ''}`}>{st.n}</span>
                  <span className="home-growth__line" aria-hidden="true" />
                </div>
                <h3 className="home-growth__t">{st.t}</h3>
                <p className="small">{st.b}</p>
                <span className="home-growth__ch">{st.ch}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHY */}
      <section aria-labelledby="why-h" className="home-why">
        <div className="home-why__inner">
          <div className="stack gap-20">
            <span className="eyebrow">WHY ALPHA DENTAL MEDIA</span>
            <h2 id="why-h" className="h2">A specialist partner, not a generalist vendor</h2>
            <p className="home-body-lg">The difference shows up in the details: how campaigns are structured, what gets measured and who you talk to every month.</p>
            <Button to={`${PATHS.contact}?topic=consultation`} className="home-why__cta">Request a Strategy Session</Button>
          </div>
          <div className="table-scroll home-why__table-wrap">
            <table className="home-why__table">
              <caption className="sr-only">Alpha Dental Media compared with a generalist agency</caption>
              <thead>
                <tr><th scope="col">WHAT MATTERS</th><th scope="col" className="is-us">ALPHA DENTAL MEDIA</th><th scope="col">GENERALIST AGENCY</th></tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.k}>
                    <th scope="row">{r.k}</th>
                    <td className="is-us"><span><CheckIcon size={18} />{r.a}</span></td>
                    <td>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section aria-labelledby="pr-h" className="home-process">
        <div className="container stack gap-48">
          <div className="home-head-row">
            <div className="stack gap-16 home-head-row__copy">
              <span className="eyebrow">HOW IT WORKS</span>
              <h2 id="pr-h" className="h2">From first call to full schedule in four steps</h2>
            </div>
            <AppLink to={`${PATHS.about}#approach`} className="link-arrow">See our full approach →</AppLink>
          </div>
          <div className="home-process__grid">
            {PROCESS.map((p) => (
              <article key={p.n} className="home-process__card">
                <span className="home-process__when">{p.when}</span>
                <h3 className="home-process__t">{p.n}. {p.t}</h3>
                <p className="small">{p.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section aria-labelledby="rs-h" className="home-results">
        <div className="container stack gap-56">
          <div className="home-center-head">
            <span className="eyebrow eyebrow--peach">RESULTS &amp; CASE STUDIES</span>
            <h2 id="rs-h" className="h2 on-dark">We report on the numbers your practice actually runs on</h2>
          </div>
          <div className="home-results__stats-wrap">
            <dl className="home-results__stats">
              {STATS.map((s) => (
                <div key={s.v} className="home-results__stat">
                  <dt className="home-results__v">{s.v}</dt>
                  <dd>{s.l}</dd>
                </div>
              ))}
            </dl>
            <p className="home-results__note">Figures shown only after verification with client data. Placeholders mark where they go.</p>
          </div>
          <div className="home-results__cases">
            {CASES.map((cs) => (
              <AppLink key={cs.tag} to={PATHS.caseStudy} className="home-case lift">
                <PhotoSlot className="home-case__photo" label={cs.alt} tag="PHOTO" cap={cs.alt} />
                <div className="home-case__body">
                  <span className="home-case__tag">{cs.tag}</span>
                  <h3 className="home-case__t">{cs.t}</h3>
                  <p className="small">{cs.b}</p>
                  <span className="home-case__cta">Read the case study →</span>
                </div>
              </AppLink>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section aria-labelledby="spc-h" className="home-specs">
        <div className="container stack gap-40">
          <div className="home-split">
            <div className="stack gap-16">
              <span className="eyebrow">INDUSTRY SPECIALTIES</span>
              <h2 id="spc-h" className="h2">Marketing shaped around your kind of dentistry</h2>
            </div>
            <p className="home-body-lg">An orthodontist courting parents and an implant practice courting retirees need different messages, keywords and budgets. We build each plan for the case mix you want more of.</p>
          </div>
          <div className="home-specs__grid">
            {SPECIALTIES.map((sp, i) => (
              <AppLink key={sp.slug} to={sp.href} className="home-spec lift">
                <span className="home-spec__top"><span className="home-spec__t">{sp.t}</span><span aria-hidden="true" className="home-spec__arrow">→</span></span>
                <span className="home-spec__b">{SPECIALTY_BLURBS[i] || sp.d}</span>
              </AppLink>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL + AI */}
      <section aria-labelledby="loc-h" className="home-local">
        <div className="home-local__inner">
          <article className="home-local__card">
            <span className="eyebrow eyebrow--teal">LOCAL SEO &amp; PATIENT ACQUISITION</span>
            <h2 id="loc-h" className="home-local__h">Own the 3-mile radius around your practice</h2>
            <p>Most new patients live close by and choose from the three practices Google shows in the map pack. We track your visibility street by street, then close the gaps with profile optimization, location pages, citations and review velocity.</p>
            <div className="home-local__grid" role="img" aria-label="Illustrative local rank grid">
              {GRID.map((c, i) => <span key={i} className={`home-local__dot home-local__dot--${c}`} />)}
            </div>
            <span className="caption">Illustrative local rank grid · green = top 3 · amber = 4–10 · gray = not ranking</span>
          </article>
          <article className="home-local__card home-local__card--dark">
            <span className="eyebrow eyebrow--peach">AI SEARCH · THE NEXT FRONTIER</span>
            <h2 className="home-local__h">Be the practice AI assistants recommend</h2>
            <p>Patients increasingly ask ChatGPT, Gemini and Google’s AI Overviews who to see. Those answers draw on clear, consistent, well-structured information. We make sure yours is the clearest.</p>
            <div className="home-local__ai">
              <span className="home-local__ai-q">“Who’s a good implant dentist near me that offers sedation?”</span>
              <span className="home-local__ai-a">Based on reviews and published information, <strong>[Your Practice]</strong> offers IV sedation for implant procedures and lists board-certified providers…</span>
              <span className="home-local__ai-note">Illustrative AI answer mockup</span>
            </div>
            <AppLink to={`${PATHS.services}#ai-search`} className="link-arrow home-local__ai-link">How AI search optimization works →</AppLink>
          </article>
        </div>
      </section>

      {/* BLOG */}
      <section aria-labelledby="bl-h" className="home-blog">
        <div className="container stack gap-40">
          <div className="home-head-row">
            <div className="stack gap-16">
              <span className="eyebrow">LEARN DENTAL MARKETING</span>
              <h2 id="bl-h" className="h2">Free guides and the latest insights</h2>
            </div>
            <AppLink to={PATHS.blog} className="link-arrow">Visit the knowledge hub →</AppLink>
          </div>
          <div className="home-blog__grid">
            <AppLink to={PATHS.article(PILLAR_SLUG)} className="home-blog__feature lift">
              <PhotoSlot className="home-blog__feature-img" label="Editorial illustration of a dental practice appearing in a local map search" tag="FEATURED GUIDE" cap="Editorial illustration: practice pin rising to the top of a local map" />
              <div className="home-blog__feature-body">
                <span className="home-blog__meta">LOCAL SEO · 18 MIN READ</span>
                <h3 className="home-blog__feature-t">The Complete Guide to Local SEO for Dentists</h3>
                <p>How the map pack works, what Google weighs most, and a 30-day checklist to climb it — written for practice owners, not marketers.</p>
              </div>
            </AppLink>
            <ul className="home-blog__list">
              {POSTS_PREVIEW.map((po) => (
                <li key={po.slug}>
                  <AppLink to={PATHS.article(po.slug)} className="home-blog__item">
                    <PhotoSlot className="home-blog__thumb" label={po.alt} />
                    <span className="home-blog__item-body">
                      <span className="home-blog__cat">{po.cat}</span>
                      <span className="home-blog__item-t">{po.t}</span>
                      <span className="home-blog__time">{po.time}</span>
                    </span>
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* FAQ */}
      <section id="faq" aria-labelledby="fq-h" className="home-faq-sec">
        <div className="home-faq-sec__inner">
          <div className="stack gap-16">
            <span className="eyebrow">FAQ</span>
            <h2 id="fq-h" className="h2">Questions practice owners ask us first</h2>
            <p>Can’t find your answer? <AppLink to={PATHS.contact}>Ask a strategist directly</AppLink>.</p>
          </div>
          <HomeFaq />
        </div>
      </section>

      {/* CONSULTATION */}
      <section id="consult" aria-labelledby="cn-h" className="home-consult">
        <div className="home-consult__panel">
          <div className="home-consult__copy">
            <span className="eyebrow eyebrow--peach">FREE CONSULTATION</span>
            <h2 id="cn-h" className="h2 on-dark home-consult__h">Let’s grow your dental practice</h2>
            <p className="home-body-lg">In 30 minutes we’ll review how patients find you today, where competitors are winning, and the three moves we’d make first.</p>
            <ul className="home-consult__list">
              <li><CheckIcon color="var(--c-coral)" />Competitor visibility snapshot</li>
              <li><CheckIcon color="var(--c-coral)" />Website and Google Business Profile review</li>
              <li><CheckIcon color="var(--c-coral)" />A prioritized 90-day plan — yours to keep</li>
            </ul>
          </div>
          <div className="home-consult__form-wrap">
            <ConsultForm />
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
