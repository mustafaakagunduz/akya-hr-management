import { test, expect } from '@playwright/test';

test('hatalı bilgilerle giriş yapılamaz', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('olmayan@sirket.com');
  await page.getByTestId('login-password').fill('YanlisSifre1');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('login-error')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('token yokken korumalı sayfa login sayfasına yönlendirir', async ({
  page,
}) => {
  await page.goto('/my-leaves');
  await expect(page).toHaveURL(/\/login$/);
});
