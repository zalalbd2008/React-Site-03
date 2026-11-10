import AppLink from './AppLink.jsx';
import './Breadcrumbs.css';

/**
 * items: [{ label, to }] — the last item is the current page (no link).
 * Pair with breadcrumbJsonLd() in <Seo jsonLd> for rich results.
 */
export default function Breadcrumbs({ items, dark = false, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`crumbs${dark ? ' crumbs--dark' : ''} ${className}`.trim()}>
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${it.label}-${i}`}>
              {last || !it.to
                ? <span aria-current={last ? 'page' : undefined}>{it.label}</span>
                : <AppLink to={it.to}>{it.label}</AppLink>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
