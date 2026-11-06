import { expect, test } from '@playwright/test';

const SECTIONS = 9;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('says who he is and how to reach him', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('body').innerText();
    expect(text).toContain('Nicholas P Smith');
    expect(text).toContain('I design and build software people love.');
    expect(text).toContain('I design everything I build.');
    expect(text).toMatch(/software engineer/i);
    expect(text).toContain('MongoDB');
    expect(text).toContain('Cisco');
    await expect(page.locator('a[href="mailto:me@nicksmith.software"]').first()).toBeAttached();
  });

  test('does not label the sections with the time of day', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('main').innerText();
    for (const label of ['Dawn', 'Early morning', 'Morning', 'Midday', 'Afternoon', 'Sunset', 'Dusk', 'Night', 'Late']) {
      expect(text).not.toMatch(new RegExp(`^${label}$`, 'm'));
    }
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

  test('shows Charleston: the houses, bridge, harbor and boats, with no hills', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.scene__row')).toBeVisible();
    await expect(page.locator('.scene__bridge')).toBeVisible();
    await expect(page.locator('.scene__water')).toBeVisible();
    await expect(page.locator('.scene__boats')).toBeVisible();
    await expect(page.locator('.cloud')).toHaveCount(3);
    await expect(page.locator('.sky__marsh')).toHaveCount(0);
  });

  for (const [width, height] of [[1440, 900], [1920, 800], [2560, 1080], [3440, 1440], [3440, 1000], [1728, 700]]) {
    test(`keeps the whole bridge in view at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const clipped = await page.evaluate(() => {
        const scene = document.querySelector('.scene')!.getBoundingClientRect();
        const bridge = document.querySelector('#bridge-art')!.getBoundingClientRect();
        return scene.top - bridge.top;
      });
      expect(clipped).toBeLessThanOrEqual(0);
    });
  }

  test('sails the boats as the reader scrolls, and only then', async ({ page }) => {
    await page.goto('/');
    const place = () => page.locator('[data-boat]').first().getAttribute('transform');
    const start = await place();
    await page.waitForTimeout(400);
    expect(await place()).toBe(start);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
    await expect.poll(place).not.toBe(start);
  });

  test('lights the windows at night and not by day', async ({ page }) => {
    await page.goto('/');
    const lights = page.locator('.scene__lights');
    await expect.poll(() => lights.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
    await page.evaluate(() => { document.documentElement.classList.remove('smooth'); scrollTo(0, document.documentElement.scrollHeight); });
    await expect.poll(() => lights.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.8);
  });

  test('keeps text readable where it passes over the houses', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    const copy = page.locator('#zimu .day__copy');
    await page.evaluate(() => {
      document.documentElement.classList.remove('smooth');
      const el = document.querySelector('#zimu .day__copy')!;
      scrollTo(0, el.getBoundingClientRect().bottom + scrollY - innerHeight + 40);
    });
    await expect(copy).toHaveClass(/is-over-scene/);
    await page.evaluate(() => {
      const el = document.querySelector('#zimu .day__copy')!;
      scrollTo(0, el.getBoundingClientRect().top + scrollY - 120);
    });
    await expect(copy).not.toHaveClass(/is-over-scene/);
  });

  test('shows the houses and the bridge on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const visible = await page.evaluate(() => {
      const box = document.querySelector('.scene__row')!.getBoundingClientRect();
      const scale = box.width / 1440;
      const shows = (x: number) => { const px = box.left + x * scale; return px > 0 && px < innerWidth; };
      return { house: shows(500), tower: shows(860) };
    });
    expect(visible).toEqual({ house: true, tower: true });
  });

  test('shows a clock that follows the scroll', async ({ page }) => {
    await page.goto('/');
    const clock = page.locator('[data-clock]');
    await expect(clock).toHaveText(/\d+:\d{2} (AM|PM) in Charleston/);
    const first = await clock.textContent();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => clock.textContent()).not.toBe(first);
  });

  test('the button turns the moving background off and back on', async ({ page }) => {
    await page.goto('/#zimu');
    const toggle = page.getByRole('button', { name: 'Moving background' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const scrolled = await page.evaluate(() => scrollY);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('html')).not.toHaveClass(/sky-live/);
    await expect(page.locator('.sky')).toBeHidden();
    const image = await page.locator('#zimu').evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(image).toContain('gradient');
    expect(await page.evaluate(() => scrollY)).toBe(scrolled);
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.sky')).toBeVisible();
  });

  test('remembers that the background is off', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Moving background' }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Moving background' })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.sky')).toBeHidden();
  });

  test('the button works when storage is blocked', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('blocked'); },
      });
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Moving background' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.sky')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('keeps a focused element clear of the navigation', async ({ page }) => {
    await page.goto('/');
    const padding = await page.locator('html').evaluate((el) => parseInt(getComputedStyle(el).scrollPaddingTop, 10));
    const navHeight = await page.locator('.nav').evaluate((el) => el.getBoundingClientRect().height);
    expect(padding).toBeGreaterThanOrEqual(navHeight);
  });
});
