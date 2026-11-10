import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import Seo from '../components/seo/Seo.jsx';
import { breadcrumbJsonLd } from '../components/seo/jsonld.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import Button from '../components/ui/Button.jsx';
import PhotoSlot from '../components/ui/PhotoSlot.jsx';
import { MailIcon, PhoneIcon, PinIcon } from '../components/ui/Icons.jsx';
import { Field, FormAlert, Honeypot } from '../components/forms/Field.jsx';
import { useLeadForm } from '../hooks/useLeadForm.js';
import { clean, rules } from '../utils/validation.js';
import { PATHS, SITE } from '../config/site.js';
import './Contact.css';

const TABS = [
  { id: 'consultation', t: 'Consultation', h: 'Book a free strategy session', p: '30 minutes with a dental marketing strategist. Bring your questions — leave with a plan.', msgLabel: 'What would you like to discuss? (optional)', msgPh: 'e.g. We want more implant consults in the North Austin area.', cta: 'Request My Session' },
  { id: 'proposal', t: 'Proposal', h: 'Request a proposal', p: 'Tell us your goals and budget range. We’ll send a scoped proposal after a short discovery call.', msgLabel: 'Goals, budget range and timeline', msgPh: 'e.g. Two offices, focus on SEO + Google Ads, starting next quarter.', cta: 'Request a Proposal' },
  { id: 'question', t: 'Question', h: 'Ask us anything', p: 'Not ready for a call? Send a question and we’ll answer it straight.', msgLabel: 'Your question', msgPh: 'Type your question here', cta: 'Send Message' },
];

const FIELDS = [
  { k: 'name', label: 'Your name', type: 'text', ph: 'Dr. Jane Smith', ac: 'name' },
  { k: 'email', label: 'Work email', type: 'email', ph: 'jane@smithdental.com', ac: 'email' },
  { k: 'phone', label: 'Phone (optional)', type: 'tel', ph: '(555) 123-4567', ac: 'tel' },
  { k: 'practice', label: 'Practice name', type: 'text', ph: 'Smith Family Dental', ac: 'organization' },
];

const VALIDATORS = {
  name: rules.name,
  email: rules.email,
  phone: (v) => (rules.optionalPhone(v) ? 'Enter a 10-digit number or leave blank.' : ''),
  practice: rules.practice,
};

const INITIAL = { name: '', email: '', phone: '', practice: '', message: '', interest: '' };

const crumbs = [{ label: 'Home', to: PATHS.home }, { label: 'Contact' }];

function ChannelCard({ k, value, note, href, Icon }) {
  const body = (
    <>
      <span className="ct-channel__icon"><Icon size={22} color="var(--c-cta)" /></span>
      <span className="ct-channel__text">
        <span className="ct-channel__k">{k}</span>
        <span className="ct-channel__v">{value}</span>
        <span className="ct-channel__note">{note}</span>
      </span>
    </>
  );
  return href
    ? <AppLink to={href} className="ct-channel ct-channel--link">{body}</AppLink>
    : <div className="ct-channel">{body}</div>;
}

export default function Contact() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef([]);
  const current = TABS[tab];

  const form = useLeadForm({
    initial: INITIAL,
    validators: VALIDATORS,
    formType: current.id,
    serialize: (v) => ({
      name: clean(v.name),
      email: clean(v.email, 254),
      phone: clean(v.phone, 40),
      practice: clean(v.practice, 160),
      message: clean(v.message, 2000),
      ...(v.interest ? { interest: clean(v.interest, 120) } : {}),
    }),
    onSuccess: () => navigate(PATHS.thankYou),
  });
  const { setValue, field, errorFor, submit, submitting, serverError, honeypotProps, setTried } = form;

  // ?topic= picks the tab, ?interest= prefills the message. Applied after hydration.
  const topic = params.get('topic');
  const interest = params.get('interest');
  useEffect(() => {
    const i = TABS.findIndex((t) => t.id === topic);
    if (i >= 0) setTab(i);
  }, [topic]);
  useEffect(() => {
    if (!interest) return;
    const v = clean(interest, 120);
    setValue('interest', v);
    setValue('message', `I'm interested in ${v}.`);
  }, [interest, setValue]);

  const selectTab = (i, focus = false) => {
    setTab(i);
    setTried(false);
    if (focus) tabRefs.current[i]?.focus();
  };

  const onTabKey = (e) => {
    const last = TABS.length - 1;
    let next = null;
    if (e.key === 'ArrowRight') next = tab === last ? 0 : tab + 1;
    else if (e.key === 'ArrowLeft') next = tab === 0 ? last : tab - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next !== null) { e.preventDefault(); selectTab(next, true); }
  };

  return (
    <>
      <Seo
        title="Contact & Book a Free Consultation"
        description="Book a free strategy session, request a proposal or ask a question. A dental marketing strategist replies within one business day."
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <section className="ct-hero">
        <div className="ct-hero__inner">
          <Breadcrumbs items={crumbs} dark />
          <h1 className="ct-title">Talk to a dental marketing expert</h1>
          <p className="ct-lead">Book a free strategy session, request a proposal or just ask a question. A real person replies within one business day.</p>
        </div>
      </section>

      <section className="ct-main">
        <div className="ct-main__inner">
          <div className="ct-card">
            <div role="tablist" aria-label="How can we help" className="ct-tabs" onKeyDown={onTabKey}>
              {TABS.map((t, i) => {
                const on = i === tab;
                return (
                  <button
                    key={t.id}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    role="tab"
                    type="button"
                    id={`ct-tab-${t.id}`}
                    aria-selected={on}
                    aria-controls="ct-panel"
                    tabIndex={on ? 0 : -1}
                    className={`ct-tab${on ? ' is-active' : ''}`}
                    onClick={() => selectTab(i)}
                  >
                    {t.t}
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" id="ct-panel" aria-labelledby={`ct-tab-${current.id}`}>
              <form onSubmit={submit} noValidate className="ct-form">
                <Honeypot {...honeypotProps} />
                <div>
                  <h2 className="ct-form__h">{current.h}</h2>
                  <p className="ct-form__p">{current.p}</p>
                </div>
                <div className="ct-fields">
                  {FIELDS.map((f) => (
                    <Field
                      key={f.k} id={`ct-${f.k}`} label={f.label} type={f.type} placeholder={f.ph} autoComplete={f.ac}
                      error={errorFor(f.k)} {...field(f.k)}
                    />
                  ))}
                </div>
                <Field
                  id="ct-msg" as="textarea" label={current.msgLabel} placeholder={current.msgPh}
                  maxLength={2000} {...field('message')}
                />
                <FormAlert>{serverError}</FormAlert>
                <Button type="submit" className="ct-submit" loading={submitting}>
                  {submitting ? 'Sending…' : current.cta}
                </Button>
                <span className="form-note">Please don’t share patient health information in this form.</span>
              </form>
            </div>
          </div>

          <aside className="ct-aside" aria-label="Other ways to reach us">
            <ChannelCard k="CALL" value={SITE.phoneDisplay} note={SITE.hours} href={SITE.phoneHref} Icon={PhoneIcon} />
            <ChannelCard k="EMAIL" value={SITE.email} note="Replies within one business day" href={SITE.emailHref} Icon={MailIcon} />
            <ChannelCard k="VISIT" value={SITE.address} note="By appointment" href="" Icon={PinIcon} />
            <PhotoSlot className="ct-map" label="Map showing the Alpha Dental Media office location" tag="MAP EMBED · [ADDRESS]" ratio="4 / 3" />
          </aside>
        </div>
      </section>
    </>
  );
}
