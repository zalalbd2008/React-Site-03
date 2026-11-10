import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { leadApiDevMiddleware, staticNotFoundMiddleware } from './scripts/dev-api.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      // Serves api/lead.js locally for `npm run dev` and `npm run preview`
      {
        name: 'lead-api',
        configureServer(server) { server.middlewares.use(leadApiDevMiddleware(env)); },
        configurePreviewServer(server) {
          server.middlewares.use(leadApiDevMiddleware(env));
          server.middlewares.use(staticNotFoundMiddleware(path.resolve('dist/client'), fs, path));
        },
      },
    ],
    build: {
      target: 'es2022',
      // One cached stylesheet for the whole site: no unstyled flash when a lazy page loads (~15 KB gzip)
      cssCodeSplit: false,
      manifest: true,
      sourcemap: false,
      modulePreload: { polyfill: false },
      assetsInlineLimit: 2048,
      rollupOptions: {
        output: {
          // Keep React + router in one long-cached vendor chunk shared by every page
          manualChunks(id) {
            if (/node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'vendor';
            return undefined;
          },
        },
      },
    },
    ssr: { noExternal: ['@fontsource-variable/inter', '@fontsource-variable/manrope'] },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      include: ['tests/unit/**/*.test.{js,jsx}'],
      css: false,
    },
  };
});
