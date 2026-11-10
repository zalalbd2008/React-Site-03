import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Seo from '../components/seo/Seo.jsx';
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import Button from '../components/ui/Button.jsx';
import Faq from '../components/ui/Faq.jsx';
import { PATHS, PILLAR_SLUG } from '../config/site.js';
import { POSTS, findPost, categoryLabel } from '../data/posts.js';
import NotFound from './NotFound.jsx';
import './Article.css';

const TOC = [
  ['what', 'What local SEO means'], ['factors', 'How Google chooses'], ['gbp', 'Google Business Profile'],
  ['reviews', 'Reviews'], ['pages', 'Location pages'], ['plan', '30-day plan'], ['faq', 'FAQ'],
];

const FACTORS = [
  { t: 'Relevance', b: 'How well your profile and website match what the searcher wants.' },
  { t: 'Distance', b: 'How far the searcher, or the area they named, is from your office.' },
  { t: 'Prominence', b: 'How well-known and trusted you are: reviews, links, mentions.' },
];

const COMPARE = [
  { a: 'City name swapped into a template', b: 'Unique copy about the neighborhood and the patients you serve' },
  { a: 'No photos', b: 'Photos of the actual office, team and parking' },
  { a: 'Generic “contact us” form', b: 'Click-to-call, online booking and directions' },
  { a: 'No structured data', b: 'Dentist schema with the correct address and hours' },
];

const FAQS = [
  { q: 'How long does local SEO take for a dental practice?', a: 'Profile fixes can show movement within weeks; consistent map-pack positions in competitive areas typically take several months of steady work.' },
  { q: 'Should every office in a group have its own profile?', a: 'Yes. Each physical location that sees patients should have its own verified profile and its own location page.' },
  { q: 'Can I offer patients an incentive for reviews?', a: 'No. Google’s policies prohibit incentivized reviews. Ask consistently and make it easy instead.' },
];

const PILLAR_RELATED = ['gbp-categories-for-dentists', 'reviews-without-privacy-risk', 'treatment-pages-that-rank'];

function relatedFor(post) {
  if (post.slug === PILLAR_SLUG) return PILLAR_RELATED.map(findPost).filter(Boolean);
  const pillar = findPost(PILLAR_SLUG);
  const others = POSTS.filter((p) => p.slug !== post.slug && p.slug !== PILLAR_SLUG && p.listed !== false);
  const sameCat = others.filter((p) => p.cat === post.cat);
  const rest = others.filter((p) => p.cat !== post.cat);
  return [pillar, ...sameCat, ...rest].filter(Boolean).slice(0, 3);
}

const topicHref = (cat) => `${PATHS.blog}?topic=${encodeURIComponent(cat)}`;

/** Highlights the TOC entry for the section currently being read. */
function useScrollSpy(ids, enabled) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const visible = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
      const firstVisible = ids.find((id) => visible.get(id));
      if (firstVisible) setActive(firstVisible);
    }, { rootMargin: '-110px 0px -55% 0px', threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids, enabled]);
  return [active, setActive];
}

const TOC_IDS = TOC.map((t) => t[0]);

export default function Article() {
  const { slug } = useParams();
  const post = findPost(slug);
  const isPillar = post?.slug === PILLAR_SLUG && post.status === 'published';
  const [active, setActive] = useScrollSpy(TOC_IDS, isPillar);

  if (!post) return <NotFound />;

  const path = PATHS.article(post.slug);
  const crumbs = [
    { label: 'Home', to: PATHS.home },
    { label: 'Blog', to: PATHS.blog },
    { label: categoryLabel(post.cat), to: topicHref(post.cat) },
    { label: post.t },
  ];
  const related = relatedFor(post);
  const published = post.status === 'published';

  return (
    <div className="art">
      <Seo
        title={post.t}
        description={post.ex}
        type="article"
        noindex={!published}
        jsonLd={published ? [
          articleJsonLd({ title: post.t, description: post.ex, path, authorName: post.author }),
          breadcrumbJsonLd(crumbs),
          ...(isPillar ? [faqJsonLd(FAQS)] : []),
        ] : []}
      />

      <article>
        <header className="art-head">
          <div className="art-head__inner">
            <Breadcrumbs items={crumbs} />
            <span className="eyebrow eyebrow--teal">{post.label || `${published ? 'GUIDE' : 'ARTICLE'} · ${post.cat}`}</span>
            <h1 className="art-head__title">{post.t}</h1>
            <p className="art-head__dek">
              {isPillar
                ? 'How Google decides which three practices appear in the map pack, what you can actually influence, and a 30-day plan to start climbing.'
                : post.ex}
            </p>
            <div className="art-byline">
              <PhotoSlot className="ph--round art-byline__avatar" label="Author portrait" />
              <div className="art-byline__text">
                <strong>{post.author}, [Title]</strong>
                <span>Reviewed by [Reviewer], [credentials] · Updated {post.date} · {post.time}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="art-hero-img">
          {isPillar ? (
            <PhotoSlot
              className="art-hero-img__slot"
              label="Editorial illustration: a dental practice map pin rising above competitors on a city map"
              tag="FEATURED IMAGE · 21:9"
              cap="Editorial illustration: a practice pin lifting above neighboring pins on a stylized city map, brand navy and orange"
              ratio="21 / 9"
            />
          ) : (
            <PhotoSlot className="art-hero-img__slot" label={post.alt} tag="FEATURED IMAGE · 21:9" ratio="21 / 9" />
          )}
        </div>

        {isPillar ? (
          <div className="art-layout">
            <aside aria-label="Table of contents" className="art-toc">
              <nav className="art-toc__nav">
                <span className="art-toc__h">IN THIS GUIDE</span>
                {TOC.map(([id, label]) => (
                  <a
                    key={id} href={`#${id}`}
                    aria-current={active === id ? 'true' : undefined}
                    className={`art-toc__link${active === id ? ' is-active' : ''}`}
                    onClick={() => setActive(id)}
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div className="art-toc__promo">
                <strong>Free local SEO checklist</strong>
                <span>The 30-day plan from this guide as a printable PDF.</span>
                <AppLink to={PATHS.freeAudit} className="link-arrow">Download free →</AppLink>
              </div>
            </aside>

            <div className="art-prose">
              <div className="art-takeaways">
                <strong>Key takeaways</strong>
                <ul>
                  <li>Google weighs three things for local results: relevance, distance and prominence.</li>
                  <li>You can’t move your office, but you can strongly influence relevance and prominence.</li>
                  <li>Your Google Business Profile, reviews and location pages do most of the work.</li>
                </ul>
              </div>

              <h2 id="what">What local SEO means for a dental practice</h2>
              <p>When someone searches “dentist near me” or “emergency dentist open now,” Google shows a map with three practices before any regular results. That block — the local pack — is where most nearby patients make their first shortlist.</p>
              <p>Local SEO is the work of earning a place in that pack, and in the organic results under it, for the searches and neighborhoods that matter to your practice.</p>

              <h2 id="factors">How Google chooses the three practices</h2>
              <p>Google’s own guidance for business profiles names three broad factors. Understanding them tells you where to spend effort.</p>
              <div className="art-factors">
                {FACTORS.map((f) => (
                  <div key={f.t} className="art-factor">
                    <strong>{f.t}</strong>
                    <span>{f.b}</span>
                  </div>
                ))}
              </div>

              <h2 id="gbp">Optimizing your Google Business Profile</h2>
              <p>Your profile is often the first impression a patient gets, and it’s the strongest local signal you control directly.</p>
              <h3>Categories</h3>
              <p>Choose the most specific primary category that describes the practice, then add secondary categories only for services you genuinely provide.</p>
              <h3>Services, photos and posts</h3>
              <ul>
                <li>List each treatment as a service with a plain-language description.</li>
                <li>Upload real photos of your team, operatories and exterior, and keep adding new ones.</li>
                <li>Use posts for new technology, community events and seasonal offers.</li>
              </ul>
              <PhotoSlot
                className="art-figure"
                label="Annotated Google Business Profile mockup highlighting categories, services, photos and reviews"
                tag="ANNOTATED MOCKUP"
                cap="Business Profile with callouts on categories, services, photos, Q&A and reviews"
                ratio="16 / 9"
              />

              <div className="art-cta">
                <div className="art-cta__text">
                  <strong>Not sure how your profile stacks up?</strong>
                  <span>We’ll compare it to the top three practices near you — free.</span>
                </div>
                <Button to={PATHS.freeAudit} size="md">Get a Free Audit</Button>
              </div>

              <h2 id="reviews">Reviews: quantity, recency and replies</h2>
              <p>Patients read reviews before they call, and review signals are part of prominence. A steady flow of new reviews usually beats a burst followed by silence.</p>
              <p>Reply to every review. Thank people warmly, and never confirm that someone is a patient or mention treatment details. That’s a privacy obligation, not just good manners.</p>

              <h2 id="pages">Location and service pages</h2>
              <p>If you serve several neighborhoods or have more than one office, each location deserves its own page with unique content: directions, parking, the team there, and the treatments offered.</p>
              <div className="table-scroll art-table-wrap">
                <table className="art-table">
                  <thead>
                    <tr><th scope="col">Weak location page</th><th scope="col">Strong location page</th></tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((c) => (
                      <tr key={c.a}><td>{c.a}</td><td>{c.b}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="plan">Your 30-day local SEO plan</h2>
              <ol>
                <li><strong>Week 1:</strong> Audit your profile, fix categories and hours, and confirm your name, address and phone match everywhere.</li>
                <li><strong>Week 2:</strong> Add services, upload 15–20 real photos and turn on messaging if your team can respond quickly.</li>
                <li><strong>Week 3:</strong> Start a consistent review-request routine at checkout and set up reply templates.</li>
                <li><strong>Week 4:</strong> Publish or improve one location page and one priority treatment page.</li>
              </ol>

              <h2 id="faq">Frequently asked questions</h2>
              <Faq items={FAQS} defaultOpen={0} headingLevel={3} className="art-faq" />

              <AuthorBox name={post.author} />
            </div>
          </div>
        ) : (
          <div className="art-draft">
            <div className="art-draft__notice" role="note">
              <span className="eyebrow">FULL ARTICLE COMING SOON</span>
              <h2 className="art-draft__title">We’re still writing this one.</h2>
              <p>{post.ex} The full article is in progress. In the meantime, our complete guide covers the fundamentals — or get a free audit and we’ll look at your practice specifically.</p>
              <div className="art-draft__actions">
                <Button to={PATHS.freeAudit}>Get a Free Audit</Button>
                <Button to={PATHS.article(PILLAR_SLUG)} variant="outline">Read the Local SEO guide</Button>
              </div>
            </div>
            <AuthorBox name={post.author} />
          </div>
        )}
      </article>

      <section aria-labelledby="art-rel-h" className="art-related">
        <div className="container stack gap-28">
          <h2 id="art-rel-h" className="art-related__h">Keep reading</h2>
          <div className="art-related__grid">
            {related.map((r) => (
              <AppLink key={r.slug} to={PATHS.article(r.slug)} className="art-rel lift">
                <PhotoSlot className="art-rel__img" label={r.t} tag={r.cat} ratio="16 / 9" />
                <div className="art-rel__body">
                  <strong>{r.t}</strong>
                  <span>{r.time}</span>
                </div>
              </AppLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AuthorBox({ name }) {
  return (
    <div className="art-author">
      <PhotoSlot className="ph--round art-author__avatar" label="Author portrait" />
      <div className="art-author__text">
        <span className="art-author__label">ABOUT THE AUTHOR</span>
        <strong>{name}</strong>
        <span>[Bio: role at Alpha Dental Media, years in dental marketing, areas of expertise. Link to author page and LinkedIn.]</span>
      </div>
    </div>
  );
}
