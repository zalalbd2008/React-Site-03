# Alpha Dental Media — React website

Production React build of the **Alpha Dental Media** design canvas (Header + mega menu, Footer, Home,
Dental SEO service, Dental Implants specialty, About, Blog, Article, Case Study, Free Audit, Contact,
Thank You and the Legal templates, plus the 390px mobile design).

| | |
|---|---|
| Stack | React 19 · Vite 8 · React Router 7 (data router) · plain CSS with design tokens |
| Rendering | Static prerender (SSG) of every route at build time → hydrated SPA |
| Runtime deps | `react`, `react-dom`, `react-router`, two self-hosted variable fonts. Nothing else. |
| Backend | One serverless function: `api/lead.js` (lead intake → your webhook/CRM) |

## Quick start

```bash
npm install
cp .env.example .env        # optional for local dev
npm run dev                 # http://localhost:5173 (lead API served locally, leads logged to the terminal)
npm run build               # client build + SSR build + prerender → dist/client
npm run preview             # serve the production build at http://localhost:4173
npm test                    # unit + component tests (Vitest)
npm run test:e2e            # end-to-end + accessibility tests against the production build (Playwright + axe)
npm run lint
```

## Architecture

```
api/                    serverless lead endpoint (+ framework-agnostic core in api/_lib)
public/                 favicon, OG image, manifest, _headers (Netlify/Cloudflare)
scripts/prerender.mjs   renders every route to static HTML + sitemap.xml + robots.txt
scripts/dev-api.mjs     serves /api/lead and the 404 page in dev/preview
src/
  components/
    layout/             Header (mega menu, mobile nav), Footer, RouteError
    ui/                 AppLink, Button, PhotoSlot, Breadcrumbs, Faq, Icons, Logo
    forms/              Field, Honeypot, FormAlert
    seo/                Seo (head manager) + JSON-LD builders
  config/               site.js (brand facts, placeholders, PATHS), navigation.js
  data/                 services, specialties, blog posts
  hooks/                useLeadForm (validation, submit, honeypot, error state)
  layouts/              SiteLayout (persistent shell, scroll restoration, focus + announcements)
  pages/                one file + one CSS file per page
  routes/               route table, prerender list, chunk prefetching
  services/             leadService (fetch with timeout and typed errors)
  styles/               tokens.css (design system), base.css, utilities.css, fonts
  utils/                validation, URL safety
tests/unit, tests/e2e
```

### Navigation (zero reload)
* All internal links go through `AppLink` → React Router `<Link>`; the document never reloads.
* Every page is its own lazy chunk. React Router keeps the current page on screen until the next
  page's code is ready, so there is no blank flash and no full-screen loader. A thin 3px progress
  bar appears only if a chunk takes longer than 150 ms.
* Chunks are prefetched on hover / focus / touch of a link, and the four most-visited pages are
  warmed up when the browser is idle (skipped on Save-Data / 2G).
* Header and footer live in `SiteLayout` and never remount; menus close after navigation.
* `<ScrollRestoration>` restores position on back/forward, starts new pages at the top and scrolls
  to `#hash` targets. After each navigation focus moves to the page `<h1>` and the new title is
  announced to screen readers.
* Query strings are real state where it matters (`/blog/?topic=SEO`, `/free-audit/?site=…`,
  `/contact/?topic=proposal`) so back/forward, refresh and sharing work.

### SEO
A pure client-side SPA would ship empty HTML to crawlers and social previews, so every route is
**prerendered to static HTML at build time** with its own `<title>`, description, canonical URL,
Open Graph/Twitter tags and JSON-LD (Organization, WebSite, Service, FAQPage, Article,
BreadcrumbList). `sitemap.xml` and `robots.txt` are generated from the same route list. Draft blog
topics are reachable but `noindex` and left out of the sitemap; the thank-you page is `noindex`.

### Performance
* Prerendered HTML → content paints before JavaScript runs (good LCP); hydration reuses it.
* Route-level code splitting, vendor chunk cached long-term, `modulepreload` for the current page's
  chunk, preloaded self-hosted fonts (`font-display: swap`, latin subset first), one small cached
  stylesheet, no third-party scripts.
* `PhotoSlot` renders `<picture>` with AVIF/WebP sources, explicit width/height and lazy loading
  when you add real photography (pass `priority` for the hero image).

### Security
* No `dangerouslySetInnerHTML` (blocked by lint rule); JSON-LD is escaped; external links validated
  (`javascript:`/`data:` never rendered as links) and opened with `noopener`.
* Strict headers in `vercel.json` / `public/_headers`: CSP (`script-src 'self'`, no third-party
  origins), HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy, COOP.
* The lead endpoint validates everything server-side with an allow-list schema, caps body size,
  checks `Origin` (CSRF), rate-limits per IP, and drops honeypot/bot-speed submissions. The delivery
  webhook URL is a server-only env var — nothing secret is in the frontend bundle.
* Forms ask users not to submit patient health information.

## Deployment (Vercel — recommended)
1. Import the repository in Vercel. Build command and output directory come from `vercel.json`.
2. Set environment variables:
   * `VITE_SITE_URL` = `https://alphadentalmedia.com` (canonical URLs, sitemap)
   * `LEAD_WEBHOOK_URL` = your Zapier/Make/CRM/Slack webhook (**server-only**; required — without it the
     form returns a clear "temporarily unavailable" error instead of losing leads)
   * `ALLOWED_ORIGINS` = `https://alphadentalmedia.com,https://www.alphadentalmedia.com`
3. Add the domain; HTTPS is automatic. `trailingSlash: true` keeps one canonical URL per page.

**Netlify / Cloudflare Pages:** publish `dist/client`, keep `public/_headers`, and port `api/lead.js`
to a Netlify Function / Pages Function (the logic lives in `api/_lib/lead-core.js` and is
framework-agnostic). **Any static host:** upload `dist/client`; serve `404.html` for unknown paths.

For multi-instance production traffic, swap the in-memory rate limiter in `lead-core.js` for a
shared store (e.g. Upstash Redis) — the function is the only place to change.

## Before launch — content placeholders
The design marks unconfirmed facts with `[square brackets]`; they are rendered as-is so nothing
false is published. Replace them in:
* `src/config/site.js` — phone (+ `phoneHref`), email (+ `emailHref`), address, hours, social URLs
* Page copy: team names/bios, founder story/quote, stats (`[00]%`), testimonials, case-study data,
  author names and dates, legal documents (have counsel write the final wording)
* Photography: every `PhotoSlot` carries its shot description; pass `src`/`sources` when photos exist
* Services/specialties without their own page link to their entry on `/services/` or
  `/specialties/` with an "Ask about this service" CTA — add pages by following the Dental SEO /
  Dental Implants templates and pointing the `href` in `src/data/*.js` at them.

## Test results (production build)
| Check | Result |
|---|---|
| Unit + component tests (Vitest) | 22 / 22 passing — validation, URL safety, lead API security, FAQ, links, SEO escaping |
| End-to-end (Playwright, desktop + Pixel 7) | 41 / 41 passing — all 18 routes render prerendered content with unique titles and no console errors or failed requests; no-reload navigation; back/forward + scroll restoration; deep links + refresh; hash links; 404; focus management; mega menu keyboard/Escape; mobile menu; no horizontal overflow at phone width; audit + contact form validation and real API submission; server-error handling |
| Accessibility (axe-core, WCAG 2.2 AA) | 0 serious/critical violations on 9 key pages |
| Lighthouse (Home, Dental SEO, pillar article, Free Audit) | Performance 96–98 · Accessibility 100 · Best Practices 100 · SEO 100 · CLS 0 · TBT ≤ 30 ms · LCP 2.1–2.3 s (simulated slow 4G) |
| `npm audit --omit=dev` (shipped code) | 0 vulnerabilities. Dev-only: 4 moderate findings in ESLint 10's `minimatch` (lint tooling, never deployed); the only fix today is downgrading to ESLint 9 |
| ESLint | clean (includes a rule that forbids `dangerouslySetInnerHTML`) |

### Small, intentional differences from the canvas
* The "FREE" badge in the announcement bar uses Alpha Orange `#C2410C` instead of Ember — white on Ember fails WCAG contrast.
* Forms go to `/thank-you/` after a successful submit (instead of an inline "done" card) so every conversion has one trackable URL.
* Header is sticky; a Call / Free Audit bar is fixed to the bottom on phones (from the mobile artboard).
* "More client stories" cards on the case study read "Story coming soon" until those case studies exist.
* The "Vantage concept" page on the canvas is a separate earlier concept and is not part of this site.
