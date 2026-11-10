import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  '/', '/services/', '/services/dental-seo/', '/specialties/', '/specialties/dental-implants/',
  '/about/', '/case-studies/implant-practice-growth/', '/blog/', '/blog/local-seo-for-dentists/',
  '/blog/dental-seo-checklist/', '/free-audit/', '/contact/', '/thank-you/',
  '/privacy-policy/', '/terms/', '/cookie-policy/', '/disclaimer/', '/accessibility/',
];

/** Collect console errors, page errors and failed same-origin requests. */
function watch(page) {
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith('http://localhost') && !r.url().includes('/does-not-exist')) problems.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  return problems;
}

test.describe('every route', () => {
  for (const path of ROUTES) {
    test(`renders ${path} with content, unique head tags and no errors`, async ({ page }) => {
      const problems = watch(page);
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
      // Prerendered: the h1 is in the HTML before any JavaScript runs
      const html = await res.text();
      expect(html).toMatch(/<h1[\s>]/);
      expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+"/);
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/Alpha Dental Media/);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc.length).toBeGreaterThan(30);
      await page.waitForLoadState('networkidle');
      expect(problems).toEqual([]);
    });
  }

  test('titles are unique across pages', async ({ request }) => {
    const titles = new Map();
    for (const path of ROUTES) {
      const html = await (await request.get(path)).text();
      const t = html.match(/<title>([^<]+)<\/title>/)[1];
      expect(titles.has(t), `duplicate title "${t}" on ${path} and ${titles.get(t)}`).toBe(false);
      titles.set(t, path);
    }
  });
});

test.describe('SPA navigation', () => {
  test('internal links never reload the document', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { window.__noReload = 'still-here'; });
    const header = page.locator('header nav[aria-label="Primary"]');

    await header.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.locator('main h1')).toBeVisible();

    await header.getByRole('button', { name: 'Services' }).click();
    await page.locator('#mega-services').getByRole('link', { name: /Dental SEO/ }).first().click();
    await expect(page).toHaveURL(/\/services\/dental-seo\/$/);

    await page.locator('footer').getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(/\/blog\/$/);

    expect(await page.evaluate(() => window.__noReload)).toBe('still-here');
  });

  test('back and forward restore pages and scroll position', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(150);
    await page.locator('footer').getByRole('link', { name: 'About Us' }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    await page.goForward();
    await expect(page).toHaveURL(/\/about\/$/);
  });

  test('direct deep link + refresh keeps the page', async ({ page }) => {
    await page.goto('/blog/?topic=SEO');
    await page.reload();
    await expect(page).toHaveURL(/topic=SEO/);
    await expect(page.locator('main h1')).toBeVisible();
  });

  test('hash links scroll to the target section', async ({ page }) => {
    await page.goto('/about/');
    await page.goto('/#faq');
    await expect(page.locator('#faq')).toBeInViewport();
  });

  test('unknown URLs show the 404 page', async ({ page }) => {
    const res = await page.goto('/does-not-exist/');
    expect(res.status()).toBe(404);
    await expect(page.locator('main h1')).toContainText(/moved or never existed/);
  });

  test('focus moves to the new page heading after navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(page.locator('main h1')).toBeFocused();
  });
});

test.describe('header menus', () => {
  test('mega menu opens, supports Escape and closes on navigation', async ({ page }) => {
    await page.goto('/about/');
    const trigger = page.getByRole('button', { name: 'Specialties' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mega-specialties')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mega-specialties')).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.getByRole('button', { name: 'Resources' }).click();
    await page.locator('#mega-resources').getByRole('link', { name: /^Blog/ }).click();
    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(page.locator('#mega-resources')).toBeHidden();
  });

  test('@mobile hamburger menu works and the page never scrolls sideways', async ({ page }) => {
    await page.goto('/');
    const burger = page.getByRole('button', { name: 'Open menu' });
    await burger.click();
    const nav = page.locator('#mobile-nav');
    await expect(nav).toBeVisible();
    await nav.getByRole('button', { name: 'Services' }).click();
    await nav.getByRole('link', { name: 'Dental SEO' }).click();
    await expect(page).toHaveURL(/\/services\/dental-seo\/$/);
    await expect(nav).toBeHidden();
  });

  test('@mobile no horizontal overflow on any page', async ({ page }) => {
    for (const path of ROUTES) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('forms', () => {
  test('homepage audit field carries the website into the Free Audit form', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('main form').first();
    await hero.getByRole('textbox').first().fill('smithdental.com');
    await hero.getByRole('button').first().click();
    await expect(page).toHaveURL(/\/free-audit\/\?site=/);
    await expect(page.getByLabel('Practice website')).toHaveValue(/smithdental\.com/);
  });

  test('free audit: validates each step and submits to the API', async ({ page }) => {
    await page.goto('/free-audit/');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Enter your website, e.g. smithdental.com.')).toBeVisible();

    await page.getByLabel('Practice website').fill('smithdental.com');
    await page.getByLabel('City and state').fill('Austin, TX');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Implant cases' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Your name').fill('Dr. Jane Smith');
    await page.getByLabel('Work email').fill('jane@smithdental.com');
    await page.waitForTimeout(2600); // the API ignores sub-2.5s (bot-speed) submissions

    const apiCall = page.waitForResponse((r) => r.url().endsWith('/api/lead'));
    await page.getByRole('button', { name: /Send My Free Audit/ }).click();
    const res = await apiCall;
    expect(res.status()).toBe(200);
    const body = JSON.parse(res.request().postData());
    expect(body).toMatchObject({ formType: 'audit', fields: { site: 'https://smithdental.com', city: 'Austin, TX' } });
    expect(body.fields.goals).toContain('Implant cases');
    await expect(page).toHaveURL(/\/thank-you\/$/);
  });

  test('contact: shows errors, then submits the proposal tab', async ({ page }) => {
    await page.goto('/contact/?topic=proposal');
    await expect(page.getByRole('tab', { name: 'Proposal' })).toHaveAttribute('aria-selected', 'true');
    const form = page.locator('main form').first();
    await form.locator('button[type="submit"]').click();
    await expect(page.getByText('Please enter your name.')).toBeVisible();
    await expect(page.getByLabel('Your name')).toBeFocused();

    await page.getByLabel('Your name').fill('Dr. Jane Smith');
    await page.getByLabel('Work email').fill('jane@smithdental.com');
    await page.getByLabel('Practice name').fill('Smith Family Dental');
    await page.waitForTimeout(2600);
    const apiCall = page.waitForResponse((r) => r.url().endsWith('/api/lead'));
    await form.locator('button[type="submit"]').click();
    expect(JSON.parse((await apiCall).request().postData()).formType).toBe('proposal');
    await expect(page).toHaveURL(/\/thank-you\/$/);
  });

  test('server errors are shown instead of a fake success', async ({ page }) => {
    await page.route('**/api/lead', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' }));
    await page.goto('/contact/');
    await page.getByLabel('Your name').fill('Dr. Jane Smith');
    await page.getByLabel('Work email').fill('jane@smithdental.com');
    await page.getByLabel('Practice name').fill('Smith Family Dental');
    await page.locator('main form').first().locator('button[type="submit"]').click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/contact\/$/);
  });
});

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const path of ['/', '/services/dental-seo/', '/specialties/dental-implants/', '/blog/', '/blog/local-seo-for-dentists/', '/free-audit/', '/contact/', '/about/', '/privacy-policy/']) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
});
