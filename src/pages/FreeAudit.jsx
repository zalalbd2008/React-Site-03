import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import Button from '../components/ui/Button.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import { PathIcon } from '../components/ui/Icons.jsx';
import { Field, FormAlert, Honeypot } from '../components/forms/Field.jsx';
import { useLeadForm } from '../hooks/useLeadForm.js';
import { clean, normalizeWebsite, rules } from '../utils/validation.js';
import { PATHS } from '../config/site.js';
import './FreeAudit.css';

const INCLUDES = [
  { key: 'local', t: 'Local visibility scan', b: 'Where you rank in the map pack across your service area.', icon: 'M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z' },
  { key: 'competitors', t: 'Competitor comparison', b: 'How you stack up against the three practices patients see first.', icon: 'M3 3v18h18M7 15l4-4 3 3 6-7' },
  { key: 'website', t: 'Website conversion review', b: 'Speed, mobile experience and how easy it is to book.', icon: 'M3 5h18v12H3zM8 21h8M12 17v4' },
  { key: 'reviews', t: 'Reviews & reputation', b: 'Rating, volume, recency and response quality.', icon: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z' },
  { key: 'ai-search', t: 'AI search check', b: 'How AI assistants describe your practice today.', icon: 'M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z' },
];

const PRACTICE_TYPES = ['General dentistry', 'Cosmetic', 'Orthodontics', 'Pediatric', 'Implants / oral surgery', 'Multi-location group'];
const GOALS = ['New patients', 'Implant cases', 'Cosmetic cases', 'Aligner starts', 'Better reviews', 'Lower ad costs'];
const FOCUS_OPTIONS = new Set(['ai-search', 'local', 'competitors', 'website', 'reviews']);

const STEPS = [
  { name: 'Your practice', title: 'Tell us about your practice', keys: ['site', 'city', 'type'] },
  { name: 'Your goals', title: 'What should the audit focus on?', keys: [] },
  { name: 'Where to send it', title: 'Where should we send your audit?', keys: ['name', 'email', 'phone'] },
];

const DEFS = {
  site: { label: 'Practice website', type: 'url', placeholder: 'smithdental.com', autoComplete: 'url', inputMode: 'url' },
  city: { label: 'City and state', type: 'text', placeholder: 'Austin, TX', autoComplete: 'address-level2' },
  type: { label: 'Practice type', as: 'select', options: PRACTICE_TYPES },
  name: { label: 'Your name', type: 'text', placeholder: 'Dr. Jane Smith', autoComplete: 'name' },
  email: { label: 'Work email', type: 'email', placeholder: 'jane@smithdental.com', autoComplete: 'email' },
  phone: { label: 'Phone (optional)', type: 'tel', placeholder: '(555) 123-4567', autoComplete: 'tel' },
};

const VALIDATORS = {
  site: rules.website,
  city: rules.city,
  name: rules.name,
  email: rules.email,
  phone: rules.optionalPhone,
};

const INITIAL = { site: '', city: '', type: PRACTICE_TYPES[0], goals: ['New patients'], name: '', email: '', phone: '', focus: '' };

const crumbs = [{ label: 'Home', to: PATHS.home }, { label: 'Free Dental Marketing Audit' }];

export default function FreeAudit() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  const form = useLeadForm({
    initial: INITIAL,
    validators: VALIDATORS,
    formType: 'audit',
    serialize: (v) => ({
      site: normalizeWebsite(v.site),
      city: clean(v.city),
      type: v.type,
      goals: v.goals,
      name: clean(v.name),
      email: clean(v.email, 254),
      phone: clean(v.phone, 40),
      ...(v.focus ? { focus: v.focus } : {}),
    }),
    onSuccess: () => navigate(PATHS.thankYou),
  });
  const { values, setValue, field, errorFor, validKeys, setTried, submit, submitting, serverError, honeypotProps } = form;

  // Prefill from ?site= (homepage hero) and ?focus= (announcement bar). Applied after hydration
  // so the prerendered markup and the first client render match.
  const siteParam = params.get('site');
  const focusParam = params.get('focus');
  useEffect(() => {
    if (siteParam) setValue('site', clean(siteParam, 253));
    if (focusParam && FOCUS_OPTIONS.has(focusParam)) setValue('focus', focusParam);
  }, [siteParam, focusParam, setValue]);

  // Move focus to the new step's heading for keyboard and screen-reader users
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
  }, [step]);

  const cur = STEPS[step];
  const last = step === STEPS.length - 1;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validKeys(cur.keys)) {
      setTried(true);
      const firstBad = cur.keys.find((k) => VALIDATORS[k]?.(values[k], values));
      if (firstBad) e.currentTarget.querySelector(`[name="${firstBad}"]`)?.focus();
      return;
    }
    if (!last) {
      setTried(false);
      setStep(step + 1);
      return;
    }
    submit(e);
  };

  const toggleGoal = (g) => {
    const on = values.goals.includes(g);
    setValue('goals', on ? values.goals.filter((x) => x !== g) : [...values.goals, g]);
  };

  const includes = useMemo(() => INCLUDES.map((i) => ({ ...i, focused: i.key === values.focus })), [values.focus]);

  return (
    <div className="fa-page">
      <Seo
        title="Free Dental Marketing Audit"
        description="Get a free, personal audit of your practice’s Google ranking, competitors, website, reviews and AI search visibility — from a dental marketing strategist."
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <div className="fa-grid">
        <div className="fa-intro">
          <Breadcrumbs items={crumbs} />
          <span className="eyebrow">FREE · NO OBLIGATION</span>
          <h1 className="fa-title">Get your free dental marketing audit</h1>
          <p className="fa-lead">A strategist personally reviews how patients find, judge and book with your practice — then shows you exactly where you’re losing them to competitors.</p>
          <ul className="fa-includes">
            {includes.map((i) => (
              <li key={i.key} className={`fa-include${i.focused ? ' is-focus' : ''}`}>
                <span className="fa-include__icon"><PathIcon d={i.icon} size={22} color="var(--c-cta)" /></span>
                <div>
                  <strong className="fa-include__t">
                    {i.t}
                    {i.focused ? <span className="fa-include__badge">Your focus</span> : null}
                  </strong>
                  <span className="fa-include__b">{i.b}</span>
                </div>
              </li>
            ))}
          </ul>
          <PhotoSlot className="fa-preview" label="Preview of a sample audit report cover and scorecard page" tag="SAMPLE REPORT PREVIEW" ratio="16 / 9" />
        </div>

        <div className="fa-card">
          <form onSubmit={onSubmit} noValidate className="fa-form" aria-labelledby="fa-step-title">
            <Honeypot {...honeypotProps} />
            <div className="fa-progress">
              <div className="fa-progress__labels">
                <span className="fa-progress__step">STEP {step + 1} OF 3</span>
                <span className="fa-progress__name">{cur.name}</span>
              </div>
              <div
                className="fa-progress__track" role="progressbar" aria-label="Form progress"
                aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-valuetext={`Step ${step + 1} of 3: ${cur.name}`}
              >
                <div className="fa-progress__bar" style={{ width: `${((step + 1) / 3) * 100}%` }} />
              </div>
            </div>

            <h2 id="fa-step-title" className="fa-step-title" tabIndex={-1} ref={headingRef}>{cur.title}</h2>

            {cur.keys.map((k) => {
              const d = DEFS[k];
              return (
                <Field
                  key={k}
                  id={`fa-${k}`}
                  label={d.label}
                  as={d.as || 'input'}
                  options={d.options}
                  type={d.type}
                  placeholder={d.placeholder}
                  autoComplete={d.autoComplete}
                  inputMode={d.inputMode}
                  error={errorFor(k)}
                  {...field(k)}
                />
              );
            })}

            {step === 1 && (
              <fieldset className="fa-goals">
                <legend>What do you want more of? (choose any)</legend>
                <div className="fa-goals__grid">
                  {GOALS.map((g) => {
                    const on = values.goals.includes(g);
                    return (
                      <button key={g} type="button" aria-pressed={on} className={`fa-goal${on ? ' is-on' : ''}`} onClick={() => toggleGoal(g)}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <FormAlert>{serverError}</FormAlert>

            <div className="fa-actions">
              {step > 0 && (
                <button type="button" className="fa-back" onClick={() => { setTried(false); setStep(step - 1); }} disabled={submitting}>Back</button>
              )}
              <Button type="submit" className="fa-submit" loading={submitting}>
                {last ? (submitting ? 'Sending…' : 'Send My Free Audit') : 'Continue'}
              </Button>
            </div>
            <span className="form-note">No credit card. No spam. Please don’t include patient information. <AppLink to={PATHS.privacy}>Privacy Policy</AppLink></span>
          </form>
        </div>
      </div>
    </div>
  );
}
