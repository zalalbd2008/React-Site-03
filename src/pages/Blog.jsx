import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { SearchIcon } from '../components/ui/Icons.jsx';
import { PATHS } from '../config/site.js';
import { POSTS, listedPosts, BLOG_CATEGORIES, categoryLabel, POPULAR_SLUGS, findPost } from '../data/posts.js';
import './Blog.css';

const CRUMBS = [{ label: 'Home', to: PATHS.home }, { label: 'Blog' }];
const PAGE_SIZE = 6;
const FREEBIES = ['Local SEO 30-day checklist', 'Review request script pack', 'Marketing budget worksheet'];

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const rawTopic = params.get('topic') || 'All';
  const topic = BLOG_CATEGORIES.includes(rawTopic) ? rawTopic : 'All';
  const urlQ = params.get('q') || '';

  const [draft, setDraft] = useState(urlQ);
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Back/forward (or a link) changed ?q — reflect it in the input
  useEffect(() => { setDraft((d) => (d === urlQ ? d : urlQ)); }, [urlQ]);

  // Debounced write of the search box into the URL (replace: typing shouldn't flood history)
  useEffect(() => {
    if (draft === urlQ) return undefined;
    const t = setTimeout(() => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (draft) next.set('q', draft); else next.delete('q');
        return next;
      }, { replace: true, preventScrollReset: true });
    }, 200);
    return () => clearTimeout(t);
  }, [draft, urlQ, setParams]);

  useEffect(() => { setLimit(PAGE_SIZE); }, [topic, urlQ]);

  const pickTopic = (c) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (c === 'All') next.delete('topic'); else next.set('topic', c);
      return next;
    }, { preventScrollReset: true });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (draft.trim()) next.set('q', draft.trim()); else next.delete('q');
      return next;
    }, { replace: true, preventScrollReset: true });
  };

  const q = draft.trim().toLowerCase();
  const filtered = useMemo(() => listedPosts().filter((p) => (
    (topic === 'All' || p.cat === topic)
    && (!q || `${p.t} ${p.ex} ${p.cat}`.toLowerCase().includes(q))
  )), [topic, q]);
  const shown = filtered.slice(0, limit);
  const featured = POSTS.find((p) => p.featured);
  const popular = POPULAR_SLUGS.map(findPost).filter(Boolean);

  return (
    <div className="blog">
      <Seo
        title="Dental Marketing Blog"
        description="Practical, no-fluff guides on SEO, Google Ads, websites and reputation — written for dental practice owners and office managers."
        jsonLd={[
          { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'The Dental Marketing Knowledge Hub' },
          breadcrumbJsonLd(CRUMBS),
        ]}
      />

      <section aria-labelledby="blog-h1" className="blog-hero">
        <div className="container stack gap-24">
          <Breadcrumbs items={CRUMBS} />
          <div className="blog-hero__grid">
            <div className="stack gap-12">
              <h1 id="blog-h1" className="blog-hero__title">The Dental Marketing Knowledge Hub</h1>
              <p className="blog-hero__lead">Practical, no-fluff guides on SEO, Google Ads, websites and reputation — written for practice owners and office managers.</p>
            </div>
            <form role="search" className="blog-search" onSubmit={onSubmit}>
              <label htmlFor="blog-q" className="sr-only">Search articles</label>
              <SearchIcon className="blog-search__icon" />
              <input
                id="blog-q" type="search" value={draft} maxLength={80}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search articles, e.g. “Google Ads”"
                className="blog-search__input"
              />
              <button type="submit" className="blog-search__btn">Search</button>
            </form>
          </div>
          <div role="group" aria-label="Filter by category" className="blog-cats">
            {BLOG_CATEGORIES.map((c) => (
              <button
                key={c} type="button" aria-pressed={topic === c}
                className={`blog-cat${topic === c ? ' is-on' : ''}`}
                onClick={() => pickTopic(c)}
              >
                {categoryLabel(c)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section aria-label="Featured article" className="blog-featured-wrap">
          <AppLink to={PATHS.article(featured.slug)} className="blog-featured lift">
            <PhotoSlot className="blog-featured__img" label={featured.alt} tag="FEATURED · EDITORIAL ILLUSTRATION" />
            <div className="blog-featured__body">
              <span className="eyebrow eyebrow--teal">{featured.label || featured.cat}</span>
              <h2 className="blog-featured__title">{featured.t}</h2>
              <p className="blog-featured__ex">{featured.ex}</p>
              <div className="blog-featured__meta">
                <PhotoSlot className="ph--round blog-avatar" label="Author portrait" />
                <span><strong>{featured.author}</strong> · [Date] · {featured.time}</span>
              </div>
            </div>
          </AppLink>
        </section>
      )}

      <section aria-labelledby="blog-latest-h" className="blog-main">
        <div className="container blog-main__layout">
          <div className="blog-list">
            <div className="blog-list__head">
              <h2 id="blog-latest-h" className="blog-list__title">
                {topic === 'All' ? 'Latest articles' : `Latest in ${topic.toLowerCase()}`}
              </h2>
              <span className="blog-list__count" aria-live="polite">{filtered.length} articles</span>
            </div>
            {filtered.length === 0 && (
              <div className="blog-empty">No articles match “{draft}”. Try “SEO”, “ads” or “reviews”.</div>
            )}
            <div className="blog-grid">
              {shown.map((p) => (
                <AppLink key={p.slug} to={PATHS.article(p.slug)} className="blog-card">
                  <PhotoSlot className="blog-card__img" label={p.alt} tag={p.cat} ratio="16 / 10" />
                  <h3 className="blog-card__title">{p.t}</h3>
                  <p className="blog-card__ex">{p.ex}</p>
                  <span className="blog-card__meta">[Author] · {p.time}</span>
                </AppLink>
              ))}
            </div>
            {filtered.length > limit && (
              <button type="button" className="blog-more" onClick={() => setLimit((l) => l + 3)}>Load more articles</button>
            )}
          </div>

          <aside aria-label="Sidebar" className="blog-side">
            <div className="blog-side__audit">
              <span className="eyebrow eyebrow--peach">FREE AUDIT</span>
              <h2 className="blog-side__audit-title">Want this done for your practice?</h2>
              <p>Get a personal review of your rankings, reviews and website.</p>
              <AppLink to={PATHS.freeAudit} className="btn btn--primary btn--md btn--block">Get My Free Audit</AppLink>
            </div>
            <div className="blog-side__box">
              <h2 className="blog-side__h">Most popular</h2>
              {popular.map((p, i) => (
                <AppLink key={p.slug} to={PATHS.article(p.slug)} className="blog-pop">
                  <span className="blog-pop__n" aria-hidden="true">{i + 1}</span>{p.t}
                </AppLink>
              ))}
            </div>
            <div id="free-resources" className="blog-side__free">
              <h2 className="blog-side__h">Free resources</h2>
              {FREEBIES.map((f) => (
                <AppLink key={f} to={PATHS.freeAudit} className="blog-free">{f}<span aria-hidden="true">↓</span></AppLink>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
