import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import { preloadWhenIdle } from '../routes/preload.js';
import { PATHS, SITE } from '../config/site.js';
import AppLink from '../components/ui/AppLink.jsx';
import { resumeSmoothScroll, suspendSmoothScroll } from '../utils/scroll.js';
import './SiteLayout.css';

/**
 * Persistent app shell: header and footer stay mounted across navigations;
 * only <Outlet/> (the page) changes.
 */
export default function SiteLayout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <NavProgress />
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <MobileActionBar />
      <RouteAnnouncer />
      <InstantScrollOnRouteChange />
      <ScrollRestoration getKey={(location) => location.pathname + location.search} />
    </>
  );
}

/**
 * Thin top progress bar shown only if a route's code takes noticeably long to load
 * (the previous page stays visible meanwhile — no full-screen loader).
 */
function NavProgress() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const loading = navigation.state !== 'idle';

  useEffect(() => {
    if (!loading) { setVisible(false); return undefined; }
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, [loading]);

  return <div className={`nav-progress${visible ? ' is-active' : ''}`} aria-hidden="true" />;
}

/**
 * After client-side navigation: announce the new page to screen readers and move
 * focus to the page's <h1> (or <main>) so keyboard users start at the new content.
 */
function RouteAnnouncer() {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      preloadWhenIdle([PATHS.freeAudit, PATHS.contact, PATHS.dentalSeo, PATHS.blog]);
      return undefined;
    }
    const t = setTimeout(() => {
      setMessage(document.title);
      if (location.hash) return; // ScrollRestoration scrolls to the anchor; keep focus where it lands
      const h1 = document.querySelector('main h1');
      const target = h1 || document.getElementById('main');
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 60);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  return <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</div>;
}

/** Fixed Call / Free Audit bar on phones (Home — Mobile 390 artboard). Hidden on conversion pages. */
function MobileActionBar() {
  const { pathname } = useLocation();
  if ([PATHS.freeAudit, PATHS.contact, PATHS.thankYou].includes(pathname)) return null;
  return (
    <div className="mbar" role="region" aria-label="Quick actions">
      <AppLink to={SITE.phoneHref || PATHS.contact} className="mbar__call">Call</AppLink>
      <AppLink to={PATHS.freeAudit} className="mbar__audit">Free Audit</AppLink>
    </div>
  );
}

/**
 * Re-enables smooth scrolling once a new page has rendered and been scrolled into place.
 * Back/forward (popstate) suspends it the same way link clicks do.
 */
function InstantScrollOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    const onPop = () => suspendSmoothScroll();
    window.addEventListener('popstate', onPop, true);
    return () => window.removeEventListener('popstate', onPop, true);
  }, []);
  useEffect(() => resumeSmoothScroll(), [pathname]);
  return null;
}
