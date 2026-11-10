import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import { CheckIcon, CrossIcon } from '../components/ui/Icons.jsx';
import { PATHS } from '../config/site.js';
import './About.css';

const CRUMBS = [{ label: 'Home', to: PATHS.home }, { label: 'About Us' }];

const PRINCIPLES = [
  { n: '01', t: 'Dental only', b: 'Depth beats breadth. Our team’s entire playbook is built around how patients choose a dentist.' },
  { n: '02', t: 'Measured in patients', b: 'Calls, forms and bookings are tracked to their source. Traffic is a means, never the goal.' },
  { n: '03', t: 'Plain-English reporting', b: 'A live dashboard and a monthly call — no jargon, no 40-page PDFs nobody reads.' },
  { n: '04', t: 'Compliance-minded', b: 'Forms, tracking and review responses designed to respect patient privacy.' },
  { n: '05', t: 'Honest about timelines', b: 'We tell you what’s realistic for your market, even when it’s not what you hoped to hear.' },
  { n: '06', t: 'Your assets, your accounts', b: 'Your website, ad accounts and data stay in your name — always.' },
];

const TEAM = [
  { r: '[Founder & CEO]', b: '[Short bio: background, dental marketing focus, one human detail.]' },
  { r: '[Head of SEO]', b: '[Short bio.]' },
  { r: '[Paid Media Lead]', b: '[Short bio.]' },
  { r: '[Client Strategist]', b: '[Short bio.]' },
];

const DO_LIST = ['A dedicated strategist who knows your practice', 'A 90-day plan before any big spend', 'Transparent pricing and scopes', 'Monthly strategy calls', 'Recommendations you can say no to'];
const DONT_LIST = ['Lock you into long contracts without results [confirm terms]', 'Hold your website or ad accounts hostage', 'Guarantee rankings no one can guarantee', 'Post fake reviews or testimonials', 'Hide behind vanity metrics'];

export default function About() {
  return (
    <div className="about">
      <Seo
        title="About Us"
        description="Alpha Dental Media is a digital marketing agency focused on one industry. We help dental practices get found, chosen and booked — and explain every dollar along the way."
        jsonLd={[
          { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Alpha Dental Media' },
          breadcrumbJsonLd(CRUMBS),
        ]}
      />

      <section aria-labelledby="about-h1" className="about-hero">
        <div className="container stack gap-40">
          <Breadcrumbs items={CRUMBS} />
          <div className="about-hero__grid">
            <h1 id="about-h1" className="about-hero__title">We exist so great dentists don’t have to become marketers.</h1>
            <p className="about-hero__lead">Alpha Dental Media is a digital marketing agency focused on one industry. We help practices get found, chosen and booked — and we explain every dollar along the way.</p>
          </div>
          <div className="about-hero__photos">
            <PhotoSlot className="about-photo about-photo--main" label="Alpha Dental Media strategy team working together around a table" tag="TEAM PHOTO" cap="Strategy team mid-workshop, natural light, candid" ratio="16 / 10" />
            <PhotoSlot className="about-photo" label="Strategist on a video call with a dental practice owner" tag="PHOTO" cap="Client call" />
            <PhotoSlot className="about-photo" label="Close-up of a whiteboard with a patient-journey map" tag="PHOTO" cap="Journey mapping" />
          </div>
        </div>
      </section>

      <section aria-labelledby="about-story-h" className="about-story">
        <div className="container about-story__grid">
          <div className="stack gap-16">
            <span className="eyebrow">OUR STORY</span>
            <h2 id="about-story-h" className="h2 about-h2">[Founding story headline — to be confirmed with leadership]</h2>
          </div>
          <div className="about-story__body">
            <p>[Founding year, founder names and the moment that started the agency. Keep it specific and true: who you saw struggling, what you built in response.]</p>
            <p>What we can say today: we believe dental practices deserve marketing partners who understand case value, compliance and the realities of a busy front desk. That belief shapes every service on this site — and the way we report on it.</p>
            <blockquote className="about-quote">
              “If we can’t show you which patients our work produced, we haven’t finished the job.”
              <span className="about-quote__by">— [Founder name], [Title]</span>
            </blockquote>
          </div>
        </div>
      </section>

      <section id="approach" aria-labelledby="about-pr-h" className="about-principles">
        <div className="container stack gap-48">
          <div className="stack gap-16 about-principles__head">
            <span className="eyebrow">OUR APPROACH</span>
            <h2 id="about-pr-h" className="h2 about-h2">Six principles we don’t compromise on</h2>
          </div>
          <div className="about-principles__grid">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="about-principle">
                <span className="about-principle__n" aria-hidden="true" data-n={p.n} />
                <h3 className="about-principle__t">{p.t}</h3>
                <p>{p.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-tm-h" className="about-team">
        <div className="container stack gap-48">
          <div className="about-team__head">
            <div className="stack gap-16">
              <span className="eyebrow eyebrow--peach">OUR TEAM</span>
              <h2 id="about-tm-h" className="h2 about-h2 on-dark">The people behind your growth</h2>
            </div>
            <span className="about-team__note">Team details shown once confirmed. Publish only real people.</span>
          </div>
          <div className="about-team__grid">
            {TEAM.map((t) => (
              <article key={t.r} className="about-member">
                <PhotoSlot label="Portrait of team member" tag="PORTRAIT" ratio="4 / 5" className="about-member__photo" />
                <div>
                  <h3 className="about-member__name">[Name]</h3>
                  <div className="about-member__role">{t.r}</div>
                </div>
                <p className="about-member__bio">{t.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-no-h" className="about-expect">
        <div className="container about-expect__grid">
          <div className="about-expect__card about-expect__card--do">
            <h2 id="about-no-h" className="about-expect__h">What you can expect</h2>
            <ul className="about-expect__list">
              {DO_LIST.map((d) => <li key={d}><CheckIcon />{d}</li>)}
            </ul>
          </div>
          <div className="about-expect__card about-expect__card--dont">
            <h2 className="about-expect__h">What we’ll never do</h2>
            <ul className="about-expect__list">
              {DONT_LIST.map((d) => <li key={d}><CrossIcon />{d}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
