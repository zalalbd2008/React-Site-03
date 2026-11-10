import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { routes } from './routes/routes.jsx';
import { HeadContext, buildHead, headToHtml } from './components/seo/Seo.jsx';

export { prerenderEntries } from './routes/prerenderPaths.js';

/**
 * Build-time render of one URL to static HTML (used by scripts/prerender.mjs).
 * Returns the app markup plus the <head> tags collected from the page's <Seo>.
 */
export async function render(url, origin = 'http://localhost') {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(new URL(url, origin)));
  if (context instanceof Response) {
    return { redirect: context.headers.get('Location'), status: context.status };
  }

  const router = createStaticRouter(handler.dataRoutes, context);
  const headCtx = { head: null };

  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <HeadContext.Provider value={headCtx}>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </HeadContext.Provider>
    </StrictMode>,
  );

  let html = '';
  for await (const chunk of prelude) html += chunk;

  return {
    html,
    head: headToHtml(headCtx.head || buildHead({ path: new URL(url, origin).pathname })),
    status: context.statusCode,
  };
}
