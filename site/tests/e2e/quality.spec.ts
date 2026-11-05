import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/', '/resume', '/mac-classic', '/no-such-page',
  '/work/powells-upholstery', '/work/chs-irrigation-lighting', '/work/disaster-maps',
  '/work/from-tired-to-iron', '/work/zimu', '/work/petdoses',
];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const summarise = (violations: { id: string; nodes: { target: unknown }[] }[]) =>
  violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => String(n.target)).join(' | ')}`);

for (const path of PAGES) {
  test(`axe passes on ${path}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude('iframe').analyze();
    expect(summarise(violations)).toEqual([]);
  });
}

for (const anchor of ['#about', '#disaster-maps', '#zimu', '#menumon', '#contact']) {
  test(`axe passes on the home page at ${anchor}`, async ({ page }) => {
    await page.goto(`/${anchor}`);
    await page.waitForTimeout(600);
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(summarise(violations)).toEqual([]);
  });
}

for (const width of [320, 375, 768, 1440]) {
  for (const path of PAGES) {
    test(`no sideways scroll at ${width}px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test('nothing shifts while the page loads or scrolls', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) (window as any).__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/');
  const cls = await page.evaluate(
    () =>
      new Promise<number>((done) => {
        document.documentElement.style.scrollBehavior = 'auto';
        const max = document.documentElement.scrollHeight - innerHeight;
        const start = performance.now();
        const step = (now: number) => {
          const k = (now - start) / 2500;
          scrollTo(0, max * Math.min(1, k));
          if (k < 1) requestAnimationFrame(step);
          else done((window as any).__cls);
        };
        requestAnimationFrame(step);
      }),
  );
  expect(cls).toBeLessThan(0.1);
});
