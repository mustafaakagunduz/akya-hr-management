import { test, expect } from '@playwright/test';
import { ADMIN, DESKTOP_VIEWPORT, login } from './helpers';

test.use({ viewport: DESKTOP_VIEWPORT });

function monthYearLabel(locale: string, date: Date) {
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    date,
  );
  return { month, year: date.getFullYear() };
}

test.describe('Takvim bileşeni', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/create-leave');
  });

  test('tıklanınca açılır, doğru ayı gösterir ve dışarı tıklanınca kapanır', async ({
    page,
  }) => {
    const now = new Date();
    const { month } = monthYearLabel('tr-TR', now);

    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();

    const calendar = page.locator('.calendar-popover');
    await expect(calendar).toBeVisible();
    await expect(calendar.locator('.calendar-select').first()).toHaveValue(
      String(now.getMonth()),
    );
    await expect(
      calendar.locator('.calendar-select').first().locator('option:checked'),
    ).toHaveText(month);

    await page.locator('h1').click();
    await expect(calendar).not.toBeVisible();
  });

  test('Escape tuşu takvimi kapatır', async ({ page }) => {
    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();
    const calendar = page.locator('.calendar-popover');
    await expect(calendar).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(calendar).not.toBeVisible();
  });

  test('Tab ile takvim kontrolleri arasında gezilebilir ve odak tamamen çıkınca kapanır', async ({
    page,
  }) => {
    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();
    const calendar = page.locator('.calendar-popover');
    await expect(calendar).toBeVisible();

    for (let i = 0; i < 55; i++) {
      await page.keyboard.press('Tab');
      if (!(await calendar.isVisible())) {
        break;
      }
    }
    await expect(calendar).not.toBeVisible();

    const focusedTag = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedTag).toBe('TEXTAREA');
  });

  test('önceki/sonraki ay butonları ile ay değişir', async ({ page }) => {
    const now = new Date();
    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();
    const calendar = page.locator('.calendar-popover');
    const monthSelect = calendar.locator('.calendar-select').first();

    await expect(monthSelect).toHaveValue(String(now.getMonth()));

    await calendar.getByRole('button', { name: 'Sonraki ay' }).click();
    const nextMonth = (now.getMonth() + 1) % 12;
    await expect(monthSelect).toHaveValue(String(nextMonth));

    await calendar.getByRole('button', { name: 'Önceki ay' }).click();
    await calendar.getByRole('button', { name: 'Önceki ay' }).click();
    const prevMonth = (now.getMonth() + 11) % 12;
    await expect(monthSelect).toHaveValue(String(prevMonth));
  });

  test('gün seçilince tarih alanına yazılır ve takvim kapanır', async ({
    page,
  }) => {
    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();
    const calendar = page.locator('.calendar-popover');

    await calendar
      .locator('.calendar-day:not(.calendar-day-outside)')
      .filter({ hasText: '15' })
      .first()
      .click();

    await expect(calendar).not.toBeVisible();
    await expect(dateInput).not.toHaveValue('');
  });

  test('"Bugün" butonu bugünün tarihini seçer', async ({ page }) => {
    const now = new Date();
    const expectedDigits = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}.${now.getFullYear()}`;

    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();
    const calendar = page.locator('.calendar-popover');
    await calendar.getByRole('button', { name: 'Bugün' }).click();

    await expect(calendar).not.toBeVisible();
    await expect(dateInput).toHaveValue(expectedDigits);
  });

  test('İngilizce dilinde ay adı doğru gösterilir', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('language-select').selectOption('en');
    await page.goto('/create-leave');

    const now = new Date();
    const { month } = monthYearLabel('en-US', now);

    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();
    const calendar = page.locator('.calendar-popover');
    await expect(
      calendar.locator('.calendar-select').first().locator('option:checked'),
    ).toHaveText(month);
    await expect(calendar.getByRole('button', { name: 'Today' })).toBeVisible();
  });

  test('yıl seçilince görüntülenen yıl değişir', async ({ page }) => {
    const now = new Date();
    const dateInput = page.getByTestId('leave-start-date');
    await dateInput.click();
    const calendar = page.locator('.calendar-popover');
    const yearSelect = calendar.locator('.calendar-select').nth(1);

    await expect(yearSelect).toHaveValue(String(now.getFullYear()));
    await yearSelect.selectOption(String(now.getFullYear() - 1));
    await expect(yearSelect).toHaveValue(String(now.getFullYear() - 1));
  });
});
