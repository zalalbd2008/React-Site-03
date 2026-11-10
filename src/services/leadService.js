import { SITE } from '../config/site.js';

export class LeadError extends Error {
  constructor(message, { status = 0, fieldErrors = null } = {}) {
    super(message);
    this.name = 'LeadError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const TIMEOUT_MS = 15000;

/**
 * Sends a lead to the backend (api/lead.js by default).
 * No secrets live here — the server holds the delivery webhook.
 *
 * @param {'audit'|'consultation'|'proposal'|'question'|'newsletter'} formType
 * @param {Record<string, unknown>} fields
 * @param {{ honeypot?: string, startedAt?: number }} meta
 */
export async function submitLead(formType, fields, meta = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(SITE.leadEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      signal: controller.signal,
      body: JSON.stringify({
        formType,
        fields,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        // Anti-spam signals checked server-side
        hp: meta.honeypot ?? '',
        elapsedMs: meta.startedAt ? Date.now() - meta.startedAt : null,
      }),
    });

    let data = null;
    try { data = await res.json(); } catch { /* non-JSON error page */ }

    if (!res.ok) {
      if (res.status === 429) throw new LeadError('Too many requests. Please wait a minute and try again.', { status: 429 });
      if (res.status === 422 && data?.errors) throw new LeadError('Please check the highlighted fields.', { status: 422, fieldErrors: data.errors });
      throw new LeadError(data?.message || 'We couldn’t send your request. Please try again or call us.', { status: res.status });
    }
    return data ?? { ok: true };
  } catch (err) {
    if (err instanceof LeadError) throw err;
    if (err?.name === 'AbortError') throw new LeadError('The request timed out. Please check your connection and try again.');
    throw new LeadError('Network error. Please check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}
