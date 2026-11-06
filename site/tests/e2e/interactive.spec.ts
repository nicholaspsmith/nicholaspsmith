import { expect, test } from '@playwright/test';

test.describe('fabric picker', () => {
  test('changes the sofa and says which fabric is on', async ({ page }) => {
    await page.goto('/#powells-upholstery');
    const picker = page.locator('[data-fabric-picker]');
    const buttons = picker.getByRole('button');
    await buttons.nth(2).click();
    await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'false');
    const name = await buttons.nth(2).getAttribute('aria-label');
    await expect(picker.locator('[data-fabric-name]')).toContainText(name!);
  });

  test('works from the keyboard', async ({ page }) => {
    await page.goto('/#powells-upholstery');
    const second = page.locator('[data-fabric-picker]').getByRole('button').nth(1);
    await second.focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('recipe scaler', () => {
  test('rescales the list and the steps', async ({ page }) => {
    await page.goto('/#from-tired-to-iron');
    const scaler = page.locator('[data-recipe]');
    await expect(scaler).toContainText('2 servings');
    await scaler.getByRole('button', { name: 'More servings' }).click();
    await expect(scaler).toContainText('3 servings');
    await expect(scaler.locator('ul')).toContainText('450 g');
    await expect(scaler.locator('ol')).toContainText('450 g');
  });

  test('stops at 1 and at 12', async ({ page }) => {
    await page.goto('/#from-tired-to-iron');
    const scaler = page.locator('[data-recipe]');
    const less = scaler.getByRole('button', { name: 'Fewer servings' });
    await less.click();
    await less.click();
    await expect(scaler).toContainText('1 serving');
    const more = scaler.getByRole('button', { name: 'More servings' });
    for (let i = 0; i < 14; i++) await more.click({ force: true });
    await expect(scaler).toContainText('12 servings');
  });
});

test.describe('subtitle words', () => {
  test('explains a word and closes with Escape', async ({ page }) => {
    await page.goto('/#zimu');
    const words = page.locator('[data-subtitle]');
    await words.getByRole('button', { name: /nǎr/ }).click();
    const popup = words.locator('[data-word-popup]');
    await expect(popup).toContainText('where');
    await expect(popup).toHaveAttribute('aria-live', 'polite');
    await page.keyboard.press('Escape');
    await expect(popup).toBeEmpty();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the pieces show a sensible still state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-fabric-picker] svg')).toBeVisible();
    await expect(page.locator('[data-recipe]')).toContainText('300 g');
    await expect(page.locator('[data-subtitle]')).toContainText('Where do you want to eat today?');
    await expect(page.locator('[data-fabric-picker] [data-prompt]')).toBeHidden();
  });
});

test.describe('day and night house', () => {
  test('switches between by day and after dark', async ({ page }) => {
    await page.goto('/#chs-irrigation-lighting');
    const house = page.locator('[data-house]');
    await expect(house).toHaveAttribute('data-mode', 'day');
    const dark = house.getByRole('button', { name: 'After dark' });
    await dark.click();
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
    await expect(house.getByRole('button', { name: 'By day' })).toHaveAttribute('aria-pressed', 'false');
    await expect(house).toHaveAttribute('data-mode', 'night');
  });
});

test.describe('hazard layers', () => {
  test('hides and shows a layer and describes the map', async ({ page }) => {
    await page.goto('/#disaster-maps');
    const map = page.locator('[data-hazards]');
    const flooding = map.getByRole('checkbox', { name: 'Flooding' });
    await expect(map.locator('[data-layer="flooding"]')).toBeVisible();
    await flooding.uncheck();
    await expect(map.locator('[data-layer="flooding"]')).toBeHidden();
    await expect(map.locator('[data-summary]')).not.toContainText('flooding');
    await expect(map.locator('[data-summary]')).toContainText('road closures');
    await expect(map).toContainText('Illustration');
  });

  test('says so when every layer is off', async ({ page }) => {
    await page.goto('/#disaster-maps');
    const map = page.locator('[data-hazards]');
    for (const box of await map.getByRole('checkbox').all()) await box.uncheck();
    await expect(map.locator('[data-summary]')).toContainText('No hazards shown');
  });
});

test.describe('dose calendar', () => {
  test('counts pills as doses are ticked and unticked', async ({ page }) => {
    await page.goto('/#petdoses');
    const calendar = page.locator('[data-doses]');
    const left = calendar.locator('[data-left]');
    const before = Number(await left.textContent());
    const dose = calendar.getByRole('checkbox', { name: 'Thursday morning' });
    await dose.check();
    await expect(left).toHaveText(String(before - 1));
    await dose.uncheck();
    await expect(left).toHaveText(String(before));
    await expect(calendar).toContainText('Sample');
  });
});
