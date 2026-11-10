/**
 * Lead intake — framework-agnostic core used by the serverless function (api/lead.js)
 * and the local dev/preview server. All validation here is authoritative; the
 * browser's validation is only for UX.
 *
 * Security controls:
 *  - JSON only, 10 KB body cap, POST only
 *  - Origin allow-list (CSRF defence for a cookie-less JSON endpoint)
 *  - Per-IP rate limit (in-memory; use a shared store such as Upstash/Redis for multi-instance prod)
 *  - Honeypot + minimum fill time bot checks (silently accepted, never delivered)
 *  - Strict field allow-list, length limits, control-char stripping, format validation
 *  - Secrets (LEAD_WEBHOOK_URL) only read from server env; never sent to the client
 */

export const MAX_BODY_BYTES = 10 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const MIN_FILL_MS = 2500;

const FORM_TYPES = new Set(['audit', 'consultation', 'proposal', 'question', 'newsletter']);

const EMAIL_RE = /^[^@\s<>()[\]\\,;:"]+@[^@\s<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const HOST_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

// eslint-disable-next-line no-control-regex
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const digits = (v) => String(v ?? '').replace(/\D/g, '');
const isPhone = (v) => { const d = digits(v); return d.length === 10 || (d.length === 11 && d.startsWith('1')); };

function normalizeWebsite(input) {
  let v = clean(input, 253);
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || !HOST_RE.test(u.hostname)) return '';
    return `${u.protocol}//${u.hostname}${u.pathname === '/' ? '' : u.pathname}`;
  } catch { return ''; }
}

/** Field schema per form type: [key, required, validator/normalizer]. */
const text = (max) => (v) => clean(v, max);
const SCHEMAS = {
  audit: {
    site: { required: true, parse: normalizeWebsite, msg: 'Enter a valid website.' },
    city: { required: true, parse: text(120), min: 2, msg: 'Enter your city.' },
    type: { required: true, parse: text(80) },
    goals: { parse: (v) => (Array.isArray(v) ? v.slice(0, 10).map((g) => clean(g, 60)).filter(Boolean) : []) },
    name: { required: true, parse: text(120), min: 2, msg: 'Enter your name.' },
    email: { required: true, parse: text(254), test: (v) => EMAIL_RE.test(v), msg: 'Enter a valid email.' },
    phone: { parse: text(40), test: (v) => !v || isPhone(v), msg: 'Enter a valid phone number.' },
    focus: { parse: text(60) },
  },
  consultation: {
    name: { required: true, parse: text(120), min: 2, msg: 'Enter your name.' },
    email: { required: true, parse: text(254), test: (v) => EMAIL_RE.test(v), msg: 'Enter a valid email.' },
    phone: { parse: text(40), test: (v) => !v || isPhone(v), msg: 'Enter a valid phone number.' },
    practice: { required: true, parse: text(160), msg: 'Enter your practice name.' },
    message: { parse: text(2000) },
    site: { parse: normalizeWebsite },
    interest: { parse: text(120) },
  },
  newsletter: {
    email: { required: true, parse: text(254), test: (v) => EMAIL_RE.test(v), msg: 'Enter a valid email.' },
  },
};
SCHEMAS.proposal = SCHEMAS.consultation;
SCHEMAS.question = SCHEMAS.consultation;

export function validateLead(formType, fields) {
  const schema = SCHEMAS[formType];
  const data = {};
  const errors = {};
  if (!schema || typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
    return { data, errors: { _form: 'Invalid form.' } };
  }
  for (const [key, rule] of Object.entries(schema)) {
    const value = rule.parse(fields[key]);
    const empty = Array.isArray(value) ? value.length === 0 : !value;
    if (rule.required && empty) { errors[key] = rule.msg || 'Required.'; continue; }
    if (!empty && rule.min && String(value).length < rule.min) { errors[key] = rule.msg || 'Too short.'; continue; }
    if (rule.test && !rule.test(value)) { errors[key] = rule.msg || 'Invalid value.'; continue; }
    if (!empty) data[key] = value;
  }
  return { data, errors };
}

// ---- rate limiting ----
const hits = new Map();
export function rateLimited(ip, now = Date.now()) {
  const key = ip || 'unknown';
  const list = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) { for (const k of hits.keys()) { hits.delete(k); if (hits.size < 2500) break; } }
  return list.length > MAX_PER_WINDOW;
}
export const _resetRateLimit = () => hits.clear();

function originAllowed(origin, host, allowed) {
  if (!origin) return true; // same-origin form posts from some browsers omit Origin on same-site requests
  try {
    const o = new URL(origin);
    if (allowed.length && allowed.includes(o.origin)) return true;
    return o.host === host; // same host as the request
  } catch { return false; }
}

/**
 * @param {{method:string, headers:Record<string,string>, body:any, ip:string}} req
 * @param {Record<string,string|undefined>} env
 * @param {{ deliver?: (lead:object)=>Promise<void>, log?: (...a:any[])=>void }} deps
 * @returns {Promise<{status:number, body:object, headers?:Record<string,string>}>}
 */
export async function handleLead(req, env = {}, deps = {}) {
  const log = deps.log || console.log;
  if (req.method !== 'POST') return { status: 405, body: { ok: false, message: 'Method not allowed.' }, headers: { Allow: 'POST' } };

  const ctype = String(req.headers['content-type'] || '');
  if (!ctype.includes('application/json')) return { status: 415, body: { ok: false, message: 'Unsupported content type.' } };

  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!originAllowed(req.headers.origin, req.headers.host, allowed)) {
    return { status: 403, body: { ok: false, message: 'Forbidden.' } };
  }

  if (rateLimited(req.ip)) return { status: 429, body: { ok: false, message: 'Too many requests.' }, headers: { 'Retry-After': '600' } };

  let payload = req.body;
  if (typeof payload === 'string') {
    if (Buffer.byteLength(payload) > MAX_BODY_BYTES) return { status: 413, body: { ok: false, message: 'Payload too large.' } };
    try { payload = JSON.parse(payload); } catch { return { status: 400, body: { ok: false, message: 'Invalid JSON.' } }; }
  }
  if (!payload || typeof payload !== 'object') return { status: 400, body: { ok: false, message: 'Invalid request.' } };

  const formType = String(payload.formType || '');
  if (!FORM_TYPES.has(formType)) return { status: 400, body: { ok: false, message: 'Unknown form.' } };

  // Bot checks: pretend success so bots learn nothing, but never deliver.
  const elapsed = Number(payload.elapsedMs);
  if (clean(payload.hp, 200) || (Number.isFinite(elapsed) && elapsed < MIN_FILL_MS)) {
    log('[lead] dropped as likely spam', { formType });
    return { status: 200, body: { ok: true } };
  }

  const { data, errors } = validateLead(formType, payload.fields);
  if (Object.keys(errors).length) return { status: 422, body: { ok: false, message: 'Validation failed.', errors } };

  const lead = {
    formType,
    fields: data,
    page: clean(payload.page, 200).startsWith('/') ? clean(payload.page, 200) : '',
    receivedAt: new Date().toISOString(),
  };

  try {
    if (deps.deliver) {
      await deps.deliver(lead);
    } else if (env.LEAD_WEBHOOK_URL) {
      const res = await fetch(env.LEAD_WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } else if (env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production') {
      log('[lead] LEAD_WEBHOOK_URL is not configured — lead not delivered');
      return { status: 503, body: { ok: false, message: 'Our form is temporarily unavailable. Please call or email us.' } };
    } else {
      log('[lead] (dev) received', JSON.stringify(lead));
    }
  } catch (err) {
    log('[lead] delivery failed', err?.message);
    return { status: 502, body: { ok: false, message: 'We couldn’t send your request. Please try again or call us.' } };
  }

  return { status: 200, body: { ok: true } };
}
