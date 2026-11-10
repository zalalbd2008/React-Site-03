import { handleLead, MAX_BODY_BYTES } from '../api/_lib/lead-core.js';

/** Connect middleware that serves POST /api/lead during `vite dev` / `vite preview`. */
export function leadApiDevMiddleware(env) {
  return (req, res, next) => {
    if (!req.url || !req.url.startsWith('/api/lead')) return next();
    let size = 0;
    let body = '';
    let aborted = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { aborted = true; res.statusCode = 413; res.end('{"ok":false}'); req.destroy(); return; }
      body += chunk;
    });
    req.on('end', async () => {
      if (aborted) return;
      const out = await handleLead(
        { method: req.method, headers: req.headers, body, ip: req.socket.remoteAddress || '' },
        { ...env, NODE_ENV: 'development' },
      );
      res.statusCode = out.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
      res.end(JSON.stringify(out.body));
    });
  };
}

/**
 * `vite preview` only: mimic production static hosting — unknown URLs get the
 * prerendered 404.html with a 404 status instead of the homepage shell.
 */
export function staticNotFoundMiddleware(clientDir, fs, path) {
  return (req, res, next) => {
    const [url, query] = (req.url || '/').split('?');
    if (req.method !== 'GET' || url.startsWith('/api/') || path.extname(url)) return next();
    const file = path.join(clientDir, decodeURIComponent(url), url.endsWith('/') ? 'index.html' : '');
    const candidates = url.endsWith('/') ? [file] : [path.join(clientDir, url, 'index.html')];
    if (candidates.some((f) => f.startsWith(clientDir) && fs.existsSync(f))) {
      if (!url.endsWith('/')) { res.statusCode = 308; res.setHeader('Location', `${url}/${query ? `?${query}` : ''}`); res.end(); return; }
      return next();
    }
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(fs.readFileSync(path.join(clientDir, '404.html')));
  };
}
