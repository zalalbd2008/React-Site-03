import { Navigate } from 'react-router';
import SiteLayout from '../layouts/SiteLayout.jsx';
import RouteError from '../components/layout/RouteError.jsx';
import { PATHS } from '../config/site.js';

/**
 * Route table. Every page is its own lazily loaded chunk; React Router keeps the
 * current page on screen until the next page's code has loaded (no blank flash,
 * no full-screen loader). Header and footer live in SiteLayout and never remount.
 */
const page = (load, props) => async () => {
  const mod = await load();
  const Page = mod.default;
  return { Component: props ? () => <Page {...props} /> : Page };
};

export const routes = [
  {
    path: '/',
    Component: SiteLayout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, lazy: page(() => import('../pages/Home.jsx')) },
      { path: 'about', lazy: page(() => import('../pages/About.jsx')) },

      { path: 'services', lazy: page(() => import('../pages/ServicesHub.jsx')) },
      { path: 'services/dental-seo', lazy: page(() => import('../pages/ServiceDentalSeo.jsx')) },

      { path: 'specialties', lazy: page(() => import('../pages/SpecialtiesHub.jsx')) },
      { path: 'specialties/dental-implants', lazy: page(() => import('../pages/SpecialtyImplants.jsx')) },

      { path: 'case-studies', element: <Navigate to={PATHS.caseStudy} replace /> },
      { path: 'case-studies/implant-practice-growth', lazy: page(() => import('../pages/CaseStudy.jsx')) },

      { path: 'blog', lazy: page(() => import('../pages/Blog.jsx')) },
      { path: 'blog/:slug', lazy: page(() => import('../pages/Article.jsx')) },

      { path: 'free-audit', lazy: page(() => import('../pages/FreeAudit.jsx')) },
      { path: 'contact', lazy: page(() => import('../pages/Contact.jsx')) },
      { path: 'thank-you', lazy: page(() => import('../pages/ThankYou.jsx')) },

      { path: 'privacy-policy', lazy: page(() => import('../pages/Legal.jsx'), { doc: 'privacy' }) },
      { path: 'terms', lazy: page(() => import('../pages/Legal.jsx'), { doc: 'terms' }) },
      { path: 'cookie-policy', lazy: page(() => import('../pages/Legal.jsx'), { doc: 'cookies' }) },
      { path: 'disclaimer', lazy: page(() => import('../pages/Legal.jsx'), { doc: 'disclaimer' }) },
      { path: 'accessibility', lazy: page(() => import('../pages/Legal.jsx'), { doc: 'accessibility' }) },

      { path: '*', lazy: page(() => import('../pages/NotFound.jsx')) },
    ],
  },
];
