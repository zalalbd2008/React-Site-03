import { handleLead, MAX_BODY_BYTES } from './_lib/lead-core.js';

/**
 * Serverless function (Vercel / Node runtime): POST /api/lead
 * Configure LEAD_WEBHOOK_URL and ALLOWED_ORIGINS in the hosting dashboard (server-side env only).
 */
export default async function handler(req, res) {
  const len = Number(req.headers['content-length'] || 0);
  if (len > MAX_BODY_BYTES) {
    res.status(413).json({ ok: false, message: 'Payload too large.' });
    return;
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
  const out = await handleLead(
    { method: req.method, headers: req.headers, body: req.body, ip },
    process.env,
  );
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
  res.status(out.status).json(out.body);
}
