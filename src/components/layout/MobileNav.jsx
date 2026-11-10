import { useEffect, useId, useRef, useState } from 'react';
import AppLink from '../ui/AppLink.jsx';
import { MOBILE_NAV } from '../../config/navigation.js';
import { PATHS, SITE } from '../../config/site.js';

/** Full-height mobile menu from the "Home — Mobile 390" artboard: accordion sections + two CTAs. */
export default function MobileNav({ open, onClose }) {
  const [section, setSection] = useState(-1);
  const ref = useRef(null);
  const baseId = useId();

  useEffect(() => {
    if (!open) { setSection(-1); return undefined; }
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden'; // lock background scroll
    // Sit directly under the sticky header bar, wherever the page is scrolled
    const bar = document.querySelector('.header');
    if (bar && ref.current) ref.current.style.top = `${Math.max(0, bar.getBoundingClientRect().bottom)}px`;
    ref.current?.querySelector('button')?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <nav id="mobile-nav" aria-label="Mobile" className={`mnav${open ? ' is-open' : ''}`} hidden={!open} ref={ref}>
      <div className="mnav__inner">
        {MOBILE_NAV.map((s, i) => {
          const isOpen = section === i;
          const panelId = `${baseId}-${i}`;
          return (
            <div className="mnav__section" key={s.t}>
              <button type="button" className="mnav__toggle" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setSection(isOpen ? -1 : i)}>
                {s.t}<span aria-hidden="true" className={`mnav__plus${isOpen ? ' is-open' : ''}`}>+</span>
              </button>
              <div id={panelId} className="mnav__links" hidden={!isOpen}>
                {s.items.map((it) => <AppLink key={it.t} to={it.href}>{it.t}</AppLink>)}
              </div>
            </div>
          );
        })}
        <div className="mnav__ctas">
          <AppLink to={PATHS.freeAudit} className="btn btn--primary btn--lg btn--block">Get a Free Audit</AppLink>
          <AppLink to={SITE.phoneHref || PATHS.contact} className="btn btn--outline btn--lg btn--block">Call {SITE.phoneDisplay}</AppLink>
        </div>
      </div>
    </nav>
  );
}
