import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, matchRoutes, RouterProvider } from 'react-router';
import { routes } from './routes/routes.jsx';
import { registerRoutes } from './routes/preload.js';
import './styles/fonts.js';
import './styles/tokens.css';
import './styles/base.css';
import './styles/utilities.css';

registerRoutes(routes);

async function start() {
  const container = document.getElementById('root');

  // Resolve the lazy route(s) for the current URL before hydrating,
  // so the prerendered HTML hydrates without flashing.
  const matches = matchRoutes(routes, window.location) || [];
  await Promise.all(matches.map(async (m) => {
    if (typeof m.route.lazy === 'function') {
      const resolved = await m.route.lazy();
      Object.assign(m.route, resolved, { lazy: undefined });
    }
  }));

  const router = createBrowserRouter(routes);
  const app = (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );

  if (container.firstElementChild) hydrateRoot(container, app);
  else createRoot(container).render(app);
}

start();
