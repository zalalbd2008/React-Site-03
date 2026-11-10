import { isRouteErrorResponse, useRouteError } from 'react-router';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Button from '../ui/Button.jsx';
import { PATHS } from '../../config/site.js';
import './RouteError.css';

/**
 * Route-level error boundary. Catches render errors and failed chunk loads
 * (e.g. a stale tab after a new deploy) and offers a recovery path.
 */
export default function RouteError() {
  const error = useRouteError();
  const chunkFailed = error instanceof Error && /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(error.message);
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (import.meta.env?.DEV) console.error(error);

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="route-error">
        <div className="route-error__inner">
          <span className="eyebrow">{notFound ? '404' : 'Something went wrong'}</span>
          <h1 className="h2">{chunkFailed ? 'This page was just updated' : notFound ? 'Page not found' : 'We hit a snag loading this page'}</h1>
          <p className="lead">
            {chunkFailed
              ? 'A newer version of the site is available. Reload to continue.'
              : 'Please try again. If it keeps happening, give us a call — we’ll help right away.'}
          </p>
          <div className="route-error__actions">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button to={PATHS.home} variant="outline">Go to homepage</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
