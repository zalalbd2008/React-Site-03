import { useEffect, useId, useRef, useState } from 'react';
import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import Button from '../components/ui/Button.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import Faq from '../components/ui/Faq.jsx';
import { CheckIcon } from '../components/ui/Icons.jsx';
import { PATHS } from '../config/site.js';
import { findService } from '../data/services.js';
import './ServiceDentalSeo.css';

const CRUMBS = [
  { label: 'Home', to: PATHS.home },
  { label: 'Services', to: PATHS.services },
  { label: 'Dental SEO' },
];

const INCLUDED = ['Technical audit & fixes', 'Treatment page content', 'Local SEO & Google Business Profile', 'Monthly rank + consult reporting'];

const JUMP = [
  { t: 'Overview', id: 'overview' },
  { t: 'Methodology', id: 'method' },
  { t: 'Process', id: 'process' },
  { t: 'Results', id: 'results' },
  { t: 'FAQ', id: 'faq' },
];

const PROBLEMS = [
  { n: '1', t: 'Ranking for the wrong searches', b: 'You show up for “dentist” but not for implants, aligners or cosmetic work.' },
  { n: '2', t: 'Thin treatment pages', b: 'Two paragraphs of template copy can’t compete with a full patient guide.' },
  { n: '3', t: 'Slow, hard-to-crawl website', b: 'Technical issues quietly cap how high any page can rank.' },
  { n: '4', t: 'Inconsistent listings', b: 'Old addresses and phone numbers across directories erode local trust.' },
  { n: '5', t: 'No idea what SEO is producing', b: 'Traffic reports with no link to calls, forms or consultations.' },
  { n: '6', t: 'Invisible in AI answers', b: 'Assistants recommend competitors whose information is clearer.' },
];

const PILLARS = [
  { t: 'Technical SEO', b: 'A fast, crawlable, secure site is the foundation. We audit and fix what keeps Google from understanding and trusting your pages.', pts: ['Core Web Vitals and mobile speed', 'Indexing, redirects and duplicate pages', 'Schema: Dentist, Service, FAQ, Breadcrumb', 'Accessibility and HTTPS hygiene'], img: 'Site health report showing speed and indexing fixes' },
  { t: 'Treatment content', b: 'Procedure pages and guides that answer cost, comfort, recovery and financing questions in plain, accurate language.', pts: ['Keyword map by procedure value', 'Clinically reviewed patient guides', 'Before-and-after galleries (with consent)', 'Internal links from blog to treatment'], img: 'Content map linking blog articles to treatment pages' },
  { t: 'Local SEO', b: 'Map-pack visibility in every neighborhood you serve, measured on a geo-grid instead of a single ranking.', pts: ['Google Business Profile optimization', 'Location and service-area pages', 'Citation cleanup and consistency', 'Review velocity and response'], img: 'Local rank geo-grid over a city map' },
  { t: 'Authority', b: 'Earned mentions and links from sources that matter locally and clinically — never bought link schemes.', pts: ['Local sponsorships and community links', 'Dental association and supplier profiles', 'Digital PR around expertise', 'Toxic link monitoring'], img: 'Network diagram of local and industry links' },
  { t: 'AI search readiness', b: 'Clear, consistent, well-structured information so AI Overviews and assistants describe and recommend your practice accurately.', pts: ['Entity consistency across the web', 'Question-led FAQ content', 'Provider credentials and E-E-A-T', 'AI answer visibility tracking'], img: 'AI assistant answer citing a dental practice' },
];

const TIMELINE = [
  { when: 'MONTH 1', t: 'Audit, tracking and quick wins', b: 'Full technical and local audit, call and form tracking installed, Google Business Profile optimized, critical fixes shipped.' },
  { when: 'MONTH 2', t: 'Keyword map and content plan', b: 'Procedures prioritized by value and difficulty; first treatment pages drafted and sent for clinical review.' },
  { when: 'MONTHS 3–4', t: 'Publish and build authority', b: 'Treatment and location pages go live; citation cleanup; first local authority campaigns.' },
  { when: 'MONTH 5', t: 'Expand and refine', b: 'Supporting articles, FAQ content and internal links; underperforming pages improved.' },
  { when: 'MONTH 6', t: 'Review and reinvest', b: 'Six-month strategy review: what’s producing consultations, and where to focus next.' },
];

const PAGE_PARTS = ['Cost & financing', 'Step-by-step process', 'Candidacy checklist', 'Recovery & comfort', 'Doctor credentials', 'FAQ with schema'];

const FAQS = [
  { q: 'How long does dental SEO take to work?', a: 'Technical fixes and Google Business Profile improvements can show movement within weeks. Competitive treatment keywords usually take several months. Your audit includes a timeline based on your market.' },
  { q: 'Do you write the content, or do we?', a: 'Our dental writers draft everything. Your clinical team reviews treatment content for accuracy before it’s published.' },
  { q: 'Will you guarantee first-page rankings?', a: 'No reputable agency can guarantee rankings. We commit to the work, transparent reporting and goals tied to consultations.' },
  { q: 'What do you need from our practice?', a: 'Website access, Google Business Profile access, a short kickoff call, and a team member to review treatment content.' },
  { q: 'How is this different from what our website company does?', a: 'Most website vendors keep the site online. Dental SEO is the ongoing work of content, local signals, authority and measurement that wins rankings.' },
];

const RELATED = [
  { slug: 'local-seo', t: 'Local SEO', b: 'Win the map pack in every neighborhood you serve.' },
  { slug: 'google-business-profile', t: 'Google Business Profile', b: 'Optimize the first thing patients see.' },
  { slug: 'content', t: 'Content Marketing', b: 'Guides and articles that feed your treatment pages.' },
  { slug: 'website-design', t: 'Dental Website Design', b: 'A faster, more convertible foundation for SEO.' },
].map((r) => ({ ...r, href: findService(r.slug)?.href || PATHS.services }));

const TITLE = 'Dental SEO that ranks you for the treatments you want more of';
const DESCRIPTION = 'Implants, Invisalign, veneers, emergency visits — Alpha Dental Media builds search visibility procedure by procedure, measured by the consultations it produces.';

/** Highlights the jump-nav item for the section currently in view. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-35% 0px -55% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const JUMP_IDS = JUMP.map((j) => j.id);

function PillarTabs() {
  const [sel, setSel] = useState(0);
  const tabRefs = useRef([]);
  const baseId = useId();
  const pillar = PILLARS[sel];

  const onKeyDown = (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next = null;
    if (e.key in keys) next = (sel + keys[e.key] + PILLARS.length) % PILLARS.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = PILLARS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setSel(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="svc-pillars">
      <div role="tablist" aria-orientation="vertical" aria-label="SEO pillars" className="svc-pillars__list" onKeyDown={onKeyDown}>
        {PILLARS.map((p, i) => {
          const on = i === sel;
          return (
            <button
              key={p.t} type="button" role="tab" id={`${baseId}-tab-${i}`}
              ref={(el) => { tabRefs.current[i] = el; }}
              aria-selected={on} aria-controls={`${baseId}-panel`} tabIndex={on ? 0 : -1}
              className={`svc-pillars__tab${on ? ' is-on' : ''}`}
              onClick={() => setSel(i)}
            >
              <span className="svc-pillars__num">{`0${i + 1}`}</span><span>{p.t}</span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${sel}`} className="svc-pillars__panel" tabIndex={0}>
        <div className="stack gap-16">
          <h3 className="svc-pillars__title">{pillar.t}</h3>
          <p className="svc-pillars__body">{pillar.b}</p>
          <ul className="svc-pillars__pts">
            {pillar.pts.map((pt) => <li key={pt}><CheckIcon color="var(--c-cta)" />{pt}</li>)}
          </ul>
        </div>
        <PhotoSlot label={pillar.img} tag="ILLUSTRATION" cap={pillar.img} ratio="4 / 3" className="svc-radius-12" />
      </div>
    </div>
  );
}

export default function ServiceDentalSeo() {
  const active = useActiveSection(JUMP_IDS);

  return (
    <div className="svc">
      <Seo
        title="Dental SEO Services"
        description={DESCRIPTION}
        jsonLd={[
          serviceJsonLd({ name: 'Dental SEO', description: DESCRIPTION, path: PATHS.dentalSeo, serviceType: 'Search engine optimization for dental practices' }),
          faqJsonLd(FAQS),
          breadcrumbJsonLd(CRUMBS),
        ]}
      />

      <section aria-labelledby="svc-h1" className="svc-hero">
        <div className="container stack gap-48">
          <Breadcrumbs items={CRUMBS} dark />
          <div className="svc-hero__grid">
            <div className="stack svc-hero__copy">
              <span className="eyebrow eyebrow--peach">DENTAL SEO SERVICES · PROPOSED</span>
              <h1 id="svc-h1" className="svc-hero__title">{TITLE}</h1>
              <p className="lead">Implants, Invisalign, veneers, emergency visits — we build search visibility procedure by procedure, so the patients finding you are the ones your schedule needs.</p>
              <div className="svc-actions">
                <Button to={`${PATHS.freeAudit}?focus=seo`}>Get a Free SEO Audit</Button>
                <Button to={`${PATHS.contact}?interest=${encodeURIComponent('Dental SEO')}`} variant="outline-dark">Talk to an SEO strategist</Button>
              </div>
            </div>
            <div className="svc-hero__media">
              <PhotoSlot
                label="Laptop showing a dental SEO dashboard with treatment keyword rankings rising"
                tag="DASHBOARD MOCKUP"
                cap="Rankings dashboard: implants, Invisalign, veneers and emergency keywords, grouped by procedure value"
                ratio="16 / 12" className="svc-radius-16"
              />
              <div className="svc-included">
                <span className="svc-included__h">WHAT’S INCLUDED</span>
                <ul>
                  {INCLUDED.map((i) => <li key={i}><CheckIcon size={18} />{i}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="On this page" className="svc-jump">
        <div className="svc-jump__inner">
          {JUMP.map((j) => (
            <a key={j.id} href={`#${j.id}`} className={`svc-jump__link${active === j.id ? ' is-active' : ''}`} aria-current={active === j.id ? 'location' : undefined}>
              {j.t}
            </a>
          ))}
          <AppLink to={PATHS.freeAudit} className="svc-jump__link svc-jump__cta">Get a free audit →</AppLink>
        </div>
      </nav>

      <section id="overview" aria-labelledby="svc-ov-h" className="section svc-anchor">
        <div className="container svc-overview">
          <div className="stack gap-16">
            <span className="eyebrow">WHY DENTAL SEO IS DIFFERENT</span>
            <h2 id="svc-ov-h" className="h2 svc-h2">One “dentist near me” ranking won’t grow production</h2>
          </div>
          <div className="stack gap-16 svc-body-lg">
            <p>A practice’s most valuable patients rarely search for “dentist.” They search for “all-on-4 cost,” “Invisalign for adults near me” or “same-day crown.” Each of those searches is a different patient, at a different stage, with a different value to your practice.</p>
            <p>Generic SEO chases traffic. Dental SEO maps every page and every link to the procedures you want to grow, then measures success by the consultations those pages produce. That’s the approach every engagement starts from.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="svc-pb-h" className="section section--alt">
        <div className="container stack gap-40">
          <h2 id="svc-pb-h" className="h2 svc-h2 svc-maxw">Problems we solve for practices like yours</h2>
          <div className="svc-problems">
            {PROBLEMS.map((p) => (
              <article key={p.n} className="svc-problem">
                <span className="svc-problem__n" aria-hidden="true">{p.n}</span>
                <div className="stack gap-8">
                  <h3 className="svc-problem__t">{p.t}</h3>
                  <p className="small">{p.b}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="method" aria-labelledby="svc-mt-h" className="section svc-anchor">
        <div className="container stack gap-40">
          <div className="stack gap-16 svc-maxw">
            <span className="eyebrow">OUR METHODOLOGY</span>
            <h2 id="svc-mt-h" className="h2 svc-h2">Five pillars of dental SEO, working together</h2>
          </div>
          <PillarTabs />
        </div>
      </section>

      <section id="process" aria-labelledby="svc-ps-h" className="section section--navy svc-anchor">
        <div className="container stack gap-48">
          <div className="stack gap-16 svc-maxw">
            <span className="eyebrow eyebrow--peach">YOUR FIRST 6 MONTHS</span>
            <h2 id="svc-ps-h" className="h2 svc-h2 on-dark">What happens, month by month</h2>
          </div>
          <ol className="svc-timeline">
            {TIMELINE.map((t) => (
              <li key={t.when}>
                <span className="svc-timeline__when">{t.when}</span>
                <span className="svc-timeline__rail" aria-hidden="true"><span className="svc-timeline__dot" /><span className="svc-timeline__line" /></span>
                <div className="stack svc-timeline__body">
                  <h3>{t.t}</h3>
                  <p>{t.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="svc-cmp-h" className="section">
        <div className="container svc-split">
          <PhotoSlot
            label="Before-and-after layout of a dental implant treatment page: thin generic page versus a full guide with cost, process, FAQs and financing"
            tag="PAGE MOCKUP · BEFORE / AFTER"
            cap="Implant treatment page: thin template copy vs. full patient guide with cost ranges, process, financing and FAQs"
            ratio="16 / 12" className="svc-radius-16"
          />
          <div className="stack svc-gap-18">
            <span className="eyebrow eyebrow--teal">TREATMENT PAGES</span>
            <h2 id="svc-cmp-h" className="svc-h2-sm">Pages that answer every question a patient has before they call</h2>
            <p className="svc-body-lg">Each priority procedure gets a page written for patients, reviewed for clinical accuracy by your team, and structured so Google and AI assistants can understand it.</p>
            <ul className="svc-parts">
              {PAGE_PARTS.map((pp) => <li key={pp}>{pp}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="results" aria-labelledby="svc-cs-h" className="section section--warm svc-anchor">
        <div className="container svc-split svc-split--48">
          <div className="stack svc-gap-18">
            <span className="eyebrow">RELATED CASE STUDY</span>
            <h2 id="svc-cs-h" className="svc-h2-sm">[Practice name]: from page three to the map pack for “[treatment] + [city]”</h2>
            <p>[Two-sentence summary of the challenge and strategy — published only with client approval and verified data.]</p>
            <div className="svc-stats">
              <div><div className="svc-stat">[+00%]</div><div className="svc-stat__l">Organic consultations</div></div>
              <div><div className="svc-stat">[00]</div><div className="svc-stat__l">Keywords in top 3</div></div>
            </div>
            <AppLink to={PATHS.caseStudy} className="link-arrow">Read the full case study →</AppLink>
          </div>
          <PhotoSlot label="Implant dentist with patient in consultation room" tag="CLIENT PHOTO" cap="Client practice photography, with permission" ratio="4 / 3" className="svc-radius-16" />
        </div>
      </section>

      <section id="faq" aria-labelledby="svc-fq-h" className="section svc-anchor">
        <div className="svc-faq-wrap stack gap-24">
          <h2 id="svc-fq-h" className="h2 svc-h2 svc-center">Dental SEO questions, answered</h2>
          <Faq items={FAQS} className="svc-faq" />
        </div>
      </section>

      <section aria-labelledby="svc-rel-h" className="svc-related">
        <div className="container stack gap-32">
          <h2 id="svc-rel-h" className="svc-related__h">Services that work alongside Dental SEO</h2>
          <div className="svc-related__grid">
            {RELATED.map((r) => (
              <AppLink key={r.slug} to={r.href} className="svc-related__card lift">
                <span className="svc-related__t">{r.t}</span>
                <span className="small">{r.b}</span>
                <span className="svc-related__more">Learn more →</span>
              </AppLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
