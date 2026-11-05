import { expect, test } from '@playwright/test';

test.describe('resume', () => {
  test('is real text with every employer and a working PDF', async ({ page, request }) => {
    await page.goto('/resume');
    const text = await page.locator('main').innerText();
    for (const employer of ['Bright Logic Digital', 'ATI', 'MongoDB', 'Cisco', 'Handsome', 'Sovos', 'Dreamline Studios', 'Fahrenheit Marketing', 'White Lion', 'El Paso Spine Center']) {
      expect(text).toContain(employer);
    }
    const href = await page.getByRole('link', { name: /PDF/ }).first().getAttribute('href');
    const pdf = await request.get(href!);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('pdf');
  });

  test('prints without the navigation', async ({ page }) => {
    await page.goto('/resume');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.nav')).toBeHidden();
  });

  test('does not link to the Menumon site', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.locator('a[href*="menumon"]')).toHaveCount(0);
  });
});

test.describe('home page experience', () => {
  test('comes from the resume', async ({ page }) => {
    await page.goto('/#contact');
    const list = page.locator('[data-experience]');
    await expect(list).toContainText('MongoDB');
    await expect(list).toContainText('Senior Software Engineer (Tech Lead)');
  });
});

test.describe('Mac Classic', () => {
  test('exists but stays out of the way', async ({ page, request }) => {
    await page.goto('/mac-classic');
    await expect(page.locator('iframe[src*="jamesfriend.com.au"]')).toBeAttached();
    await page.goto('/');
    await expect(page.locator('nav a[href="/mac-classic"]')).toHaveCount(0);
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).not.toContain('mac-classic');
    expect(sitemap).toContain('/work/zimu');
  });
});

test.describe('404', () => {
  test('is styled and leads home', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('link', { name: /start of the day/i })).toHaveAttribute('href', '/');
    await expect(page.locator('[data-stop]')).toBeVisible();
  });
});

test.describe('metadata', () => {
  const PAGES = ['/', '/resume', '/work/zimu', '/work/powells-upholstery'];

  test('every page has its own title, description, image and canonical', async ({ page }) => {
    const titles = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      titles.add(await page.title());
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/nicholaspsmith\.com\//);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(`https://nicholaspsmith.com${path === '/' ? '/' : path}`);
    }
    expect(titles.size).toBe(PAGES.length);
  });

  test('the share image exists', async ({ request }) => {
    const res = await request.get('/og.png');
    expect(res.status()).toBe(200);
  });

  test('the home page describes him as a Person', async ({ page }) => {
    await page.goto('/');
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const person = JSON.parse(json!);
    expect(person['@type']).toBe('Person');
    expect(person.email).toBe('mailto:me@nicksmith.software');
    expect(person.sameAs).toContain('https://www.linkedin.com/in/nps90/');
  });
});
