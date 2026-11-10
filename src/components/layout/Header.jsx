import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import AppLink from '../ui/AppLink.jsx';
import { LogoMark } from '../ui/Logo.jsx';
import { ChevronDown, CloseIcon, MenuIcon, PhoneIcon } from '../ui/Icons.jsx';
import MegaPanel from './MegaPanel.jsx';
import MobileNav from './MobileNav.jsx';
import { PRIMARY_NAV } from '../../config/navigation.js';
import { PATHS, SITE } from '../../config/site.js';
import './Header.css';

function activeSection(pathname) {
  if (pathname.startsWith('/services')) return 'services';
  if (pathname.startsWith('/specialties')) return 'specialties';
  if (pathname.startsWith('/case-studies')) return 'results';
  if (pathname.startsWith('/blog')) return 'resources';
  if (pathname.startsWith('/about')) return 'about';
  return '';
}

const HOVER_OPEN_MS = 120;
const HOVER_CLOSE_MS = 220;

export default function Header() {
  const location = useLocation();
  const [open, setOpen] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);
  const triggerRefs = useRef({});
  const hoverTimer = useRef(null);
  const openedByHoverAt = useRef(0);
  const active = activeSection(location.pathname);

  // Close every menu after a client-side navigation
  useEffect(() => {
    setOpen('');
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const close = useCallback((returnFocus = false) => {
    setOpen((cur) => {
      if (returnFocus && cur) triggerRefs.current[cur]?.focus();
      return '';
    });
  }, []);

  // Escape + outside click close the open mega panel
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(true); };
    const onDown = (e) => { if (!headerRef.current?.contains(e.target)) close(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [open, close]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const onTriggerClick = (id) => {
    // A click right after hover-open should not immediately close the panel
    if (open === id && Date.now() - openedByHoverAt.current < 500) return;
    setOpen((cur) => (cur === id ? '' : id));
  };

  const hoverOpen = (id, e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setOpen((cur) => { if (cur !== id) openedByHoverAt.current = Date.now(); return id; });
    }, open ? 0 : HOVER_OPEN_MS);
  };
  const hoverLeave = (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(''), HOVER_CLOSE_MS);
  };
  const hoverStay = () => clearTimeout(hoverTimer.current);

  const phoneTo = SITE.phoneHref || PATHS.contact;

  return (
    <div className="site-top" ref={headerRef}>
      <div className="announce">
        <span className="announce__badge">FREE</span>
        <span className="announce__text">Is your practice visible in Google’s AI Overviews? Get a free AI-search visibility check.</span>
        <span className="announce__text announce__text--short">Free AI-search visibility check</span>
        <AppLink to={`${PATHS.freeAudit}?focus=ai-search`} className="announce__link">Check my practice →</AppLink>
      </div>

      <header className="header" onPointerLeave={hoverLeave} onPointerEnter={hoverStay}>
        <nav aria-label="Primary" className="header__bar">
          <AppLink to={PATHS.home} className="brand" aria-label="Alpha Dental Media home">
            <LogoMark />
            <span className="brand__text">
              <span className="brand__name">Alpha Dental</span>
              <span className="brand__sub">MEDIA</span>
            </span>
          </AppLink>

          <ul className="header__menu">
            {PRIMARY_NAV.map((item) => {
              const isOpen = open === item.panel;
              const isActive = active === item.id;
              if (item.panel) {
                return (
                  <li key={item.id} onPointerEnter={(e) => hoverOpen(item.panel, e)}>
                    <button
                      type="button"
                      ref={(el) => { triggerRefs.current[item.panel] = el; }}
                      className={`menu-btn${isOpen ? ' is-open' : ''}${isActive ? ' is-active' : ''}`}
                      aria-expanded={isOpen}
                      aria-controls={`mega-${item.panel}`}
                      onClick={() => onTriggerClick(item.panel)}
                    >
                      {item.label}<ChevronDown className="menu-btn__chev" />
                    </button>
                  </li>
                );
              }
              return (
                <li key={item.id} onPointerEnter={(e) => { if (e.pointerType === 'mouse') { clearTimeout(hoverTimer.current); setOpen(''); } }}>
                  <AppLink to={item.href} className={`menu-link${isActive ? ' is-active' : ''}`} aria-current={isActive ? 'page' : undefined}>
                    {item.label}
                  </AppLink>
                </li>
              );
            })}
          </ul>

          <div className="header__actions">
            <AppLink to={phoneTo} className="header__phone">
              <PhoneIcon /><span>{SITE.phoneDisplay}</span>
            </AppLink>
            <AppLink to={PATHS.freeAudit} className="btn btn--primary btn--md header__cta">Get a Free Audit</AppLink>
            <AppLink to={phoneTo} className="icon-btn header__call" aria-label={`Call us ${SITE.phoneDisplay}`}>
              <PhoneIcon size={20} />
            </AppLink>
            <button
              type="button"
              className="icon-btn icon-btn--navy header__burger"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>

        {PRIMARY_NAV.filter((i) => i.panel).map((i) => (
          <MegaPanel key={i.panel} id={i.panel} open={open === i.panel} label={`${i.label} menu`} />
        ))}
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
