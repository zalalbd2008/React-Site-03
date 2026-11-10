import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import Seo from '../components/seo/Seo.jsx';
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import Button from '../components/ui/Button.jsx';
import ArticleBody, { Inline } from '../components/article/ArticleBody.jsx';
import { PATHS, PILLAR_SLUG } from '../config/site.js';
import { POSTS, findPost, categoryLabel } from '../data/posts.js';
import { ARTICLES } from '../data/articles/index.js';
import NotFound from './NotFound.jsx';
import './Article.css';

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

const EMPTY = [];
/** TOC label: heading text without inline Markdown. */
const tocLabel = (t) => t.replace(/\*\*/g, '');

export default function Article() {
  const { slug } = useParams();
  const post = findPost(slug);
  const article = post && post.status === 'published' ? ARTICLES[post.slug] : null;
  const toc = useMemo(() => (article ? article.content.filter((b) => b.type === 'h2').map((b) => [b.id, tocLabel(b.text)]) : EMPTY), [article]);
  const tocIds = useMemo(() => toc.map((t) => t[0]), [toc]);
  const [active, setActive] = useScrollSpy(tocIds, Boolean(article));

  if (!post) return <NotFound />;

  const path = PATHS.article(post.slug);
  const crumbs = [
    { label: 'Home', to: PATHS.home },
    { label: 'Blog', to: PATHS.blog },
    { label: categoryLabel(post.cat), to: topicHref(post.cat) },
    { label: post.t },
  ];
  const related = relatedFor(post);
  const published = Boolean(article);
  const image = article ? { src: article.imageSvg, png: article.image, alt: article.imageAlt } : null;

  return (
    <div className="art">
      <Seo
        title={article ? article.metaTitle : post.t}
        description={article ? article.metaDescription : post.ex}
        type="article"
        image={image?.png}
        noindex={!published}
        jsonLd={published ? [
          articleJsonLd({
            title: article.title, description: article.metaDescription, path, authorName: post.author,
            datePublished: post.dateModified, dateModified: post.dateModified,
            images: [image.png, ...article.figures.map((f) => ({ src: f.src, caption: f.caption, width: f.width, height: f.height }))],
          }),
          breadcrumbJsonLd(crumbs),
          ...(article.faqs.length ? [faqJsonLd(article.faqs)] : []),
        ] : []}
      />

      <article>
        <header className="art-head">
          <div className="art-head__inner">
            <Breadcrumbs items={crumbs} />
            <span className="eyebrow eyebrow--teal">{post.label || `${published ? 'GUIDE' : 'ARTICLE'} · ${post.cat}`}</span>
            <h1 className="art-head__title">{article ? article.title : post.t}</h1>
            <p className="art-head__dek">{article ? article.metaDescription : post.ex}</p>
            <div className="art-byline">
              <PhotoSlot className="ph--round art-byline__avatar" label="Author portrait" />
              <div className="art-byline__text">
                <strong>{article ? article.author : `${post.author}, [Title]`}</strong>
                <span>Reviewed by {article ? article.reviewer : '[Reviewer], [credentials]'} · Updated {post.date} · {post.time}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="art-hero-img">
          {image ? (
            <PhotoSlot className="art-hero-img__slot" src={image.src} label={image.alt} width={1200} height={630} ratio="1200 / 630" priority />
          ) : (
            <PhotoSlot className="art-hero-img__slot" label={post.alt} tag="FEATURED IMAGE · 21:9" ratio="21 / 9" />
          )}
        </div>

        {article ? (
          <div className="art-layout">
            <aside aria-label="Table of contents" className="art-toc">
              <nav className="art-toc__nav">
                <span className="art-toc__h">IN THIS GUIDE</span>
                {toc.map(([id, label]) => (
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
                <strong>Free marketing audit</strong>
                <span>See how your practice compares with the top three competitors near you.</span>
                <AppLink to={PATHS.freeAudit} className="link-arrow">Get my free audit →</AppLink>
              </div>
            </aside>

            <div className="art-prose">
              {article.takeaways.length ? (
                <div className="art-takeaways">
                  <strong>Key takeaways</strong>
                  <ul>{article.takeaways.map((t, i) => <li key={i}><Inline text={t} /></li>)}</ul>
                </div>
              ) : null}
              <ArticleBody blocks={article.content} figures={article.figures} />
              <AuthorBox name={article.author} />
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
                <PhotoSlot
                  className="art-rel__img" label={r.t} tag={r.cat} ratio="16 / 9"
                  {...(r.status === 'published' ? { src: `/images/site/blog/${r.slug}/card.svg`, width: 960, height: 600 } : null)}
                />
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
