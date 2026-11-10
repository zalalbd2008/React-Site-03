import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { PATHS } from '../config/site.js';
import './NotFound.css';

const POPULAR = [
  { t: 'Dental SEO', to: PATHS.dentalSeo },
  { t: 'All services', to: PATHS.services },
  { t: 'Dental implant marketing', to: PATHS.implants },
  { t: 'Blog', to: PATHS.blog },
  { t: 'About us', to: PATHS.about },
];

export default function NotFound() {
  return (
    <section className="nf">
      <Seo title="Page Not Found" description="The page you were looking for doesn’t exist." noindex />
      <div className="nf__inner">
        <span className="eyebrow">404 · PAGE NOT FOUND</span>
        <h1 className="h1">This page has moved or never existed.</h1>
        <p className="lead">Let’s get you back on track. Try one of these, or ask us directly.</p>
        <div className="nf__actions">
          <Button to={PATHS.home}>Go to homepage</Button>
          <Button to={PATHS.contact} variant="outline">Contact us</Button>
        </div>
        <nav aria-label="Popular pages" className="nf__links">
          {POPULAR.map((p) => <AppLink key={p.to} to={p.to} className="link-arrow">{p.t} →</AppLink>)}
        </nav>
      </div>
    </section>
  );
}
