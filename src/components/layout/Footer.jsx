import AppLink from '../ui/AppLink.jsx';
import { LogoMark } from '../ui/Logo.jsx';
import { FOOTER_COLUMNS, LEGAL_LINKS } from '../../config/navigation.js';
import { PATHS, SITE } from '../../config/site.js';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__cta">
          <div className="stack gap-12">
            <h2 className="footer__cta-title">Ready to fill your schedule with the right patients?</h2>
            <p className="footer__cta-body">Talk with a dental marketing strategist. No contracts to sign on the call — just a clear plan.</p>
          </div>
          <div className="footer__cta-actions">
            <AppLink to={PATHS.contact} className="btn btn--primary btn--lg">Book a Free Consultation</AppLink>
            <AppLink to={PATHS.freeAudit} className="btn btn--outline-dark btn--lg">Get a Free Audit</AppLink>
          </div>
        </div>

        <div className="footer__grid">
          <div className="footer__brand">
            <span className="footer__logo"><LogoMark inverse /><span>{SITE.name}</span></span>
            <p>{SITE.description}</p>
            <address>
              <span>{SITE.address}</span>
              <AppLink to={SITE.phoneHref || PATHS.contact}>{SITE.phoneDisplay}</AppLink>
              <AppLink to={SITE.emailHref || PATHS.contact}>{SITE.email}</AppLink>
            </address>
            <ul className="footer__social" aria-label="Social media">
              {SITE.social.map((s) => (
                <li key={s.key}>
                  {s.href
                    ? <AppLink to={s.href} aria-label={s.label}>{s.key}</AppLink>
                    : <span role="img" aria-label={`${s.label} (coming soon)`} className="is-pending">{s.key}</span>}
                </li>
              ))}
            </ul>
          </div>
          {FOOTER_COLUMNS.map((c) => (
            <nav key={c.h} aria-label={c.h} className="footer__col">
              <span className="footer__col-h">{c.h.toUpperCase()}</span>
              {c.links.map((l) => <AppLink key={l.t} to={l.href}>{l.t}</AppLink>)}
            </nav>
          ))}
        </div>

        <div className="footer__legal">
          <span>© {SITE.copyrightYear} {SITE.name}. All rights reserved.</span>
          <nav aria-label="Legal" className="footer__legal-links">
            {LEGAL_LINKS.map((l) => <AppLink key={l.t} to={l.href}>{l.t}</AppLink>)}
          </nav>
        </div>
      </div>
    </footer>
  );
}
