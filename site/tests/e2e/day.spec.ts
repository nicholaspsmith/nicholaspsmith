import { expect, test } from '@playwright/test';

const SECTIONS = 9;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('says who he is and how to reach him', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('body').innerText();
    expect(text).toContain('Nicholas P Smith');
    expect(text).toMatch(/software engineer/i);
    expect(text).toContain('MongoDB');
    expect(text).toContain('Cisco');
    await expect(page.locator('a[href="mailto:me@nicksmith.software"]').first()).toBeAttached();
  });

  test('gives every section its own sky', async ({ page }) => {
    await page.goto('/');
    const sections = page.locator('[data-stop]');
    await expect(sections).toHaveCount(SECTIONS);
    for (let i = 0; i < SECTIONS; i++) {
      const image = await sections.nth(i).evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(image).toContain('gradient');
    }
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keeps still skies and no moving palm', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/sky-live/);
    await expect(page.locator('.sky')).toBeHidden();
    const image = await page.locator('[data-stop="sunset"]').evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(image).toContain('gradient');
  });
});

test.describe('the live sky', () => {
  const lateOpacity = (page: import('@playwright/test').Page) =>
    page.locator('.sky__layer[data-stop-layer="late"]').evaluate((el) => getComputedStyle(el).opacity);

  test('reaches late night at the contact section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/sky-live/);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => lateOpacity(page)).toBe('1');
  });

  test('matches the position on first paint when opened at #contact', async ({ page }) => {
    await page.goto('/#contact');
    await expect.poll(() => lateOpacity(page)).toBe('1');
  });

  test('jumps straight to an anchor instead of flying through the day', async ({ page }) => {
    await page.addInitScript(() => {
      const samples: number[] = [];
      (window as any).__samples = samples;
      const sample = () => {
        samples.push(scrollY);
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto('/#contact');
    await expect.poll(() => lateOpacity(page)).toBe('1');
    await page.waitForTimeout(1600);
    const { samples, end } = await page.evaluate(() => ({ samples: (window as any).__samples as number[], end: scrollY }));
    const inBetween = samples.filter((y) => y > end * 0.05 && y < end * 0.95);
    expect(inBetween).toEqual([]);
  });

  test('still scrolls smoothly for links clicked on the page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await expect.poll(() => page.locator('html').evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('smooth');
  });

  test('follows the sections when the viewport changes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#zimu');
    await page.setViewportSize({ width: 390, height: 800 });
    await page.locator('#zimu').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(() => page.locator('html').getAttribute('data-sky')).toBe('sunset');
  });

  test('shows a clock that follows the scroll', async ({ page }) => {
    await page.goto('/');
    const clock = page.locator('[data-clock]');
    await expect(clock).toHaveText(/\d+:\d{2} (AM|PM) in Charleston/);
    const first = await clock.textContent();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => clock.textContent()).not.toBe(first);
  });

  test('pauses the palm even when storage is blocked', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('blocked'); },
      });
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    const pause = page.getByRole('button', { name: /pause/i });
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    const state = await page.locator('.sky__palm').evaluate((el) => getComputedStyle(el).animationPlayState);
    expect(state).toBe('paused');
    expect(errors).toEqual([]);
  });

  test('keeps a focused element clear of the navigation', async ({ page }) => {
    await page.goto('/');
    const padding = await page.locator('html').evaluate((el) => parseInt(getComputedStyle(el).scrollPaddingTop, 10));
    const navHeight = await page.locator('.nav').evaluate((el) => el.getBoundingClientRect().height);
    expect(padding).toBeGreaterThanOrEqual(navHeight);
  });
});
