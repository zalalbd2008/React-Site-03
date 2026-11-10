import { Fragment } from 'react';
import AppLink from '../ui/AppLink.jsx';
import Button from '../ui/Button.jsx';
import { CheckIcon } from '../ui/Icons.jsx';

/**
 * Inline Markdown subset used in article data: **bold**, *italic*, `code`, [text](href).
 * Parsed into React elements — never injected as HTML — so article text can't introduce
 * scripts. Links go through AppLink, which keeps internal links client-side and rejects
 * unsafe URL schemes.
 */
const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
export function Inline({ text }) {
  const parts = String(text).split(INLINE).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) return <AppLink key={i} to={link[2]}>{link[1]}</AppLink>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Infographic with a caption that stands on its own (read by search engines and AI tools). */
export function Figure({ fig }) {
  return (
    <figure className="art-fig">
      <img src={fig.src} alt={fig.alt} width={fig.width} height={fig.height} loading="lazy" decoding="async" />
      <figcaption>{fig.caption}</figcaption>
    </figure>
  );
}

function Callout({ block }) {
  return (
    <aside className="art-callout" aria-label={block.title}>
      <strong className="art-callout__title">{block.title}</strong>
      {block.body.map((b, i) => <p key={i}><Inline text={b} /></p>)}
      <div className="art-callout__actions">
        <Button to={block.cta.href} size="md">{block.cta.label}</Button>
        {block.note ? <span className="art-callout__note">{block.note}</span> : null}
      </div>
    </aside>
  );
}

const cell = (t) => <Inline text={t} />;

/** Renders the structured blocks in src/data/articles/*.json; figures go after their H2. */
export default function ArticleBody({ blocks, figures = [] }) {
  const after = new Map();
  figures.forEach((f) => after.set(f.after, [...(after.get(f.after) || []), f]));

  return blocks.map((b, i) => {
    let el;
    switch (b.type) {
      case 'h2': el = <h2 id={b.id}><Inline text={b.text} /></h2>; break;
      case 'h3': el = <h3 id={b.id}><Inline text={b.text} /></h3>; break;
      case 'answer': el = <p className="art-answer"><Inline text={b.text} /></p>; break;
      case 'label': el = <p className="art-label"><Inline text={b.text} /></p>; break;
      case 'p': el = <p><Inline text={b.text} /></p>; break;
      case 'ul': el = <ul>{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ul>; break;
      case 'ol': el = <ol>{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ol>; break;
      case 'checklist': el = (
        <ul className="art-checklist">
          {b.items.map((t, j) => <li key={j}><CheckIcon size={20} aria-hidden="true" /><span><Inline text={t} /></span></li>)}
        </ul>
      ); break;
      case 'quote': el = <blockquote className="art-quote"><Inline text={b.text} /></blockquote>; break;
      case 'table': el = (
        <div className="table-scroll art-table-wrap">
          <table className="art-table">
            <thead><tr>{b.head.map((h, j) => <th key={j} scope="col">{cell(h || ' ')}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, j) => (
              <tr key={j}>{r.map((c, k) => (k === 0 ? <th key={k} scope="row">{cell(c)}</th> : <td key={k}>{cell(c)}</td>))}</tr>
            ))}</tbody>
          </table>
        </div>
      ); break;
      case 'callout': el = <Callout block={b} />; break;
      case 'disclaimer': el = <p className="art-disclaimer" role="note"><Inline text={b.text} /></p>; break;
      default: el = null;
    }
    const figs = b.type === 'h2' ? after.get(b.id) : null;
    return (
      <Fragment key={i}>
        {el}
        {figs ? figs.map((f) => <Figure key={f.id} fig={f} />) : null}
      </Fragment>
    );
  });
}
