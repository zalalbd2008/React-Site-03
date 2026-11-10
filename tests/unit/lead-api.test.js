import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleLead, validateLead, _resetRateLimit } from '../../api/_lib/lead-core.js';

const req = (body, extra = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', host: 'alphadentalmedia.com', origin: 'https://alphadentalmedia.com', ...(extra.headers || {}) },
  body: typeof body === 'string' ? body : JSON.stringify(body),
  ip: extra.ip || '1.1.1.1',
  ...(extra.method ? { method: extra.method } : {}),
});

const consult = { formType: 'consultation', elapsedMs: 9000, hp: '', fields: { name: 'Dr. Jane', email: 'jane@smithdental.com', practice: 'Smith Dental', phone: '' } };
const silent = () => {};

describe('lead API', () => {
  beforeEach(() => _resetRateLimit());

  it('accepts a valid consultation and delivers it', async () => {
    const deliver = vi.fn().mockResolvedValue();
    const out = await handleLead(req(consult), {}, { deliver, log: silent });
    expect(out.status).toBe(200);
    expect(deliver).toHaveBeenCalledOnce();
    expect(deliver.mock.calls[0][0].fields).toMatchObject({ name: 'Dr. Jane', practice: 'Smith Dental' });
  });

  it('rejects non-POST, wrong content type and foreign origins', async () => {
    expect((await handleLead(req(consult, { method: 'GET' }), {}, { log: silent })).status).toBe(405);
    expect((await handleLead({ ...req(consult), headers: { 'content-type': 'text/plain', host: 'a.com' } }, {}, { log: silent })).status).toBe(415);
    const evil = await handleLead(req(consult, { headers: { origin: 'https://evil.example' } }), {}, { log: silent });
    expect(evil.status).toBe(403);
  });

  it('returns field errors for invalid input', async () => {
    const bad = { ...consult, fields: { name: 'J', email: 'nope', practice: '' } };
    const out = await handleLead(req(bad), {}, { deliver: vi.fn(), log: silent });
    expect(out.status).toBe(422);
    expect(Object.keys(out.body.errors)).toEqual(expect.arrayContaining(['name', 'email', 'practice']));
  });

  it('silently drops honeypot and too-fast submissions', async () => {
    const deliver = vi.fn();
    expect((await handleLead(req({ ...consult, hp: 'spam' }), {}, { deliver, log: silent })).status).toBe(200);
    expect((await handleLead(req({ ...consult, elapsedMs: 300 }), {}, { deliver, log: silent })).status).toBe(200);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('rate limits bursts from one IP', async () => {
    const deliver = vi.fn().mockResolvedValue();
    let last;
    for (let i = 0; i < 10; i += 1) last = await handleLead(req(consult, { ip: '9.9.9.9' }), {}, { deliver, log: silent });
    expect(last.status).toBe(429);
  });

  it('refuses to silently swallow leads in production without a webhook', async () => {
    const out = await handleLead(req(consult), { NODE_ENV: 'production' }, { log: silent });
    expect(out.status).toBe(503);
  });

  it('drops unknown fields and normalizes the audit website', () => {
    const { data, errors } = validateLead('audit', {
      site: 'smithdental.com', city: 'Austin, TX', type: 'General dentistry', goals: ['New patients'],
      name: 'Jane', email: 'jane@smithdental.com', isAdmin: true,
    });
    expect(errors).toEqual({});
    expect(data.site).toBe('https://smithdental.com');
    expect(data).not.toHaveProperty('isAdmin');
  });
});
