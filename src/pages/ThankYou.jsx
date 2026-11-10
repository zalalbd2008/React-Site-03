import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { CheckIcon } from '../components/ui/Icons.jsx';
import { PATHS, PILLAR_SLUG } from '../config/site.js';
import './ThankYou.css';

const STEPS = [
  { when: 'WITHIN 1 BUSINESS DAY', t: 'We reach out', b: 'A strategist emails you to confirm details and, for consultations, offer times.' },
  { when: 'BEFORE YOUR CALL', t: 'We do our homework', b: 'We review your website, Google profile, reviews and top local competitors.' },
  { when: 'ON THE CALL', t: 'You get a clear plan', b: 'Findings, priorities and a realistic timeline. No pressure to sign anything.' },
];

export default function ThankYou() {
  return (
    <div className="ty">
      <Seo title="Thank You" description="Your request has been received. Here’s what happens next." noindex />
      <div className="ty__inner">
        <span className="ty__badge"><CheckIcon size={44} color="#FFFFFF" /></span>
        <div className="stack gap-12">
          <h1 className="ty__title">Thank you — we’ve got it from here.</h1>
          <p className="ty__lead">Your request reached a real person on our team. Here’s exactly what happens next.</p>
        </div>
        <ol className="ty__steps">
          {STEPS.map((s) => (
            <li key={s.t}>
              <span className="ty__when">{s.when}</span>
              <strong>{s.t}</strong>
              <span className="small">{s.b}</span>
            </li>
          ))}
        </ol>
        <div className="ty__promo">
          <div className="stack gap-4">
            <strong>While you wait</strong>
            <span className="small">Start with our most complete guide to winning local patients.</span>
          </div>
          <Button to={PATHS.article(PILLAR_SLUG)} size="md">Local SEO for Dentists →</Button>
        </div>
        <AppLink to={PATHS.home} className="link-arrow">← Back to homepage</AppLink>
      </div>
    </div>
  );
}
