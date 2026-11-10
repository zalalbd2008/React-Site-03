/**
 * Standalone lead API for a VPS (no dependencies): serves POST /api/lead on 127.0.0.1.
 * Nginx serves the static site and proxies /api/ here. Same logic as the Vercel function.
 *
 *   PORT=3001 LEAD_WEBHOOK_URL=... ALLOWED_ORIGINS=... node server/lead-server.mjs
 */
import http from 'node:http';
import { handleLead, MAX_BODY_BYTES } from '../api/_lib/lead-core.js';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '127.0.0.1';

const server = http.createServer((req, res) => {
  const send = (status, body, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
    res.end(JSON.stringify(body));
  };

  if (!req.url || !req.url.startsWith('/api/lead')) return send(404, { ok: false, message: 'Not found.' });
  if (req.method === 'GET' && req.url === '/api/lead/health') return send(200, { ok: true });

  let size = 0;
  const chunks = [];
  let aborted = false;
  req.on('data', (c) => {
    size += c.length;
    if (size > MAX_BODY_BYTES) { aborted = true; send(413, { ok: false, message: 'Payload too large.' }); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', async () => {
    if (aborted) return;
    try {
      // Nginx sets X-Real-IP; never trust it unless we're bound to localhost behind Nginx
      const ip = String(req.headers['x-real-ip'] || req.socket.remoteAddress || '');
      const out = await handleLead(
        { method: req.method, headers: req.headers, body: Buffer.concat(chunks).toString('utf8'), ip },
        { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' },
      );
      send(out.status, out.body, out.headers);
    } catch (err) {
      console.error('[lead] unexpected error', err?.message);
      send(500, { ok: false, message: 'Something went wrong. Please try again or call us.' });
    }
  });
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(PORT, HOST, () => console.log(`[lead] listening on http://${HOST}:${PORT}`));

const stop = () => server.close(() => process.exit(0));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
