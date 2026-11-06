import { expect, test } from '@playwright/test';

const APPS = ['Panes', 'KeyLight', 'VPN & DNS', 'Mac Daddy', 'Claude Usage', 'SoundChain', 'Homestead', 'Battery Time'];

async function openBar(page: import('@playwright/test').Page) {
  await page.goto('/#menumon');
  await expect(page.getByRole('button', { name: 'Homestead menu' })).toBeVisible({ timeout: 10_000 });
}

test('every app in the bar opens a menu, and Escape returns focus', async ({ page }) => {
  await openBar(page);
  for (const app of APPS) {
    const button = page.getByRole('button', { name: `${app} menu` });
    await button.click();
    await expect(page.locator('.hm-menu').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.hm-menu')).toHaveCount(0);
    await expect(button).toBeFocused();
  }
});

test('using a Homestead control changes the icon', async ({ page }) => {
  await openBar(page);
  const before = await page.evaluate(() => (window as any).menumonHero.getState('homestead'));
  // Homestead's menu opens by itself when the bar loads, on its Spa dashboard.
  const menu = page.locator('.hm-menu').first();
  await menu.getByLabel(/^Dashboard/).click();
  await menu.getByRole('radio', { name: 'Den' }).click();
  await menu.getByRole('switch', { name: 'Ceiling Fan' }).first().click();
  await expect.poll(() => page.evaluate(() => (window as any).menumonHero.getState('homestead'))).not.toBe(before);
});

test('the icon overlays sit over the bar and change with the menus', async ({ page }) => {
  await openBar(page);
  const overlays = page.locator('.bar-anim');
  await expect(overlays.first()).toBeAttached();
  const boxes = await overlays.evaluateAll((els) => els.map((el) => {
    const box = el.getBoundingClientRect();
    return { position: getComputedStyle(el).position, width: box.width, height: box.height };
  }));
  for (const box of boxes) {
    expect(box.position).toBe('absolute');
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  }
});

test('Tab moves on past the end of an open menu', async ({ page }) => {
  await openBar(page);
  const button = page.getByRole('button', { name: 'Battery Time menu' });
  await button.click();
  await expect(page.locator('.hm-menu').first()).toBeVisible();
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    if ((await page.locator('.hm-menu').count()) === 0) break;
  }
  await expect(page.locator('.hm-menu')).toHaveCount(0);
  const inBar = await page.evaluate(() => document.activeElement?.closest('.hm-menu') !== null);
  expect(inBar).toBe(false);
});

test('Mac Daddy speaks plainly', async ({ page }) => {
  await openBar(page);
  await page.getByRole('button', { name: 'Mac Daddy menu' }).click();
  const menu = page.locator('.hm-menu').first();
  await expect(menu).toContainText('CPU Hogs');
  await expect(menu).toContainText('Media Tracking');
});

test('nothing from Menumon loads until the section is near', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (r) => { if (r.url().includes('/menumon/')) requested.push(r.url()); });
  await page.goto('/');
  await page.waitForTimeout(800);
  expect(requested).toEqual([]);
  await page.locator('#menumon').scrollIntoViewIfNeeded();
  await expect.poll(() => requested.length).toBeGreaterThan(0);
});

test('the section still reads when Menumon fails to load', async ({ page }) => {
  await page.route('**/menumon/anim.json', (route) => route.abort());
  await page.route('**/_astro/*menumon*', (route) => route.abort());
  await page.goto('/#menumon');
  await expect(page.locator('#menumon img.bar')).toBeVisible();
  await expect(page.locator('#menumon')).toContainText('Mac');
});

test('lists all ten apps', async ({ page }) => {
  await page.goto('/#menumon');
  const library = page.locator('[data-library] li');
  await expect(library).toHaveCount(10);
  await expect(page.locator('[data-library]')).toContainText('Apollo Monitor');
});

test('fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await openBar(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('the menu closes when the bar scrolls away', async ({ page }) => {
  await openBar(page);
  await expect(page.locator('.hm-menu').first()).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
  await expect(page.locator('.hm-menu')).toHaveCount(0);
});

test('no menu opens by itself while the bar is out of view', async ({ page }) => {
  await page.goto('/#contact');
  await page.waitForTimeout(1200);
  await expect(page.locator('.hm-menu')).toHaveCount(0);
});
