import { expect, test } from '@playwright/test';

const SLUGS = [
  'powells-upholstery', 'chs-irrigation-lighting', 'disaster-maps',
  'from-tired-to-iron', 'zimu', 'petdoses',
];

for (const slug of SLUGS) {
  test(`/work/${slug} reads as a plain project page`, async ({ page }) => {
    const res = await page.goto(`/work/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator(`a[href="/#${slug}"]`).first()).toBeAttached();
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/\b(React|TypeScript|API|Next\.js|Flask)\b/);
    for (const heading of ['The problem', 'What I did', 'The result']) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });
}

test('there is no Menumon project page', async ({ page }) => {
  const res = await page.goto('/work/menumon');
  expect(res?.status()).toBe(404);
});

test('DisasterMaps states his role and credits the team', async ({ page }) => {
  await page.goto('/work/disaster-maps');
  const text = await page.locator('main').innerText();
  expect(text).toMatch(/my role/i);
  expect(text).toMatch(/Troy Swayney/);
  expect(text).toMatch(/Chris Edmonds/);
});

test('every project section on the home page links to its page', async ({ page }) => {
  await page.goto('/');
  for (const slug of SLUGS) {
    await expect(page.locator(`#${slug} a[href="/work/${slug}"]`)).toBeAttached();
  }
  await expect(page.locator('a[href*="menumon.nicksmith.software"]')).toHaveCount(0);
});
