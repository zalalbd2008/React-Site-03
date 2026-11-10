import AppLink from '../ui/AppLink.jsx';
import { MENU_DATA } from '../../config/navigation.js';
import { PATHS } from '../../config/site.js';

/**
 * Mega-menu panels (Services · Specialties · Resources).
 * Panels stay in the DOM (hidden) so crawlers and the prerendered HTML contain every nav link.
 */
export default function MegaPanel({ id, open, label }) {
  return (
    <div id={`mega-${id}`} role="region" aria-label={label} className={`mega${open ? ' is-open' : ''}`} hidden={!open}>
      {id === 'services' && (
        <div className="mega__inner mega__inner--services">
          {MENU_DATA.services.map((col) => (
            <div key={col.id} className="mega__col">
              <span className="mega__heading">{col.h.toUpperCase()}</span>
              {col.items.map((it) => (
                <AppLink key={it.slug} to={it.href} className="mega__item">
                  <span className="mega__item-t">{it.t}</span>
                  <span className="mega__item-d">{it.d}</span>
                </AppLink>
              ))}
            </div>
          ))}
          <AppLink to={PATHS.freeAudit} className="mega__promo">
            <span className="mega__promo-eyebrow">FREE FOR PRACTICE OWNERS</span>
            <span className="mega__promo-title">See exactly why patients choose the practice down the street</span>
            <span className="mega__promo-body">A personal audit of your Google ranking, reviews, website and ads.</span>
            <span className="mega__promo-cta">Get my free audit →</span>
          </AppLink>
        </div>
      )}

      {id === 'specialties' && (
        <div className="mega__inner mega__inner--grid">
          {MENU_DATA.specialties.map((sp) => (
            <AppLink key={sp.slug} to={sp.href} className="mega__spec">
              <span className="mega__mono" aria-hidden="true">{sp.k}</span>
              <span>{sp.t}</span>
            </AppLink>
          ))}
        </div>
      )}

      {id === 'resources' && (
        <div className="mega__inner mega__inner--grid">
          {MENU_DATA.resources.map((r) => (
            <AppLink key={r.t} to={r.href} className="mega__item">
              <span className="mega__item-t">{r.t}</span>
              <span className="mega__item-d">{r.d}</span>
            </AppLink>
          ))}
        </div>
      )}
    </div>
  );
}
