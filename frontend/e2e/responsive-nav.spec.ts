import { test, expect } from '@playwright/test';
import { ADMIN, DESKTOP_VIEWPORT, MOBILE_VIEWPORT, login } from './helpers';

test.describe('Mobil navigasyon', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('hamburger menüsü mobil çekmeceyi açar ve kapatır', async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);

    const drawer = page.locator('.mobile-drawer');
    await expect(drawer).not.toBeVisible();

    await page.locator('.app-navbar-menu-btn').click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('Ayarlar');
    await expect(drawer).toContainText('Çıkış Yap');

    await page.locator('.mobile-drawer-close').click();
    await expect(drawer).not.toBeVisible();
  });

  test('çekmece dışına tıklanınca kapanır', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.locator('.app-navbar-menu-btn').click();

    const drawer = page.locator('.mobile-drawer');
    await expect(drawer).toBeVisible();
    await page.locator('.mobile-drawer-overlay').click({ position: { x: 5, y: 5 } });
    await expect(drawer).not.toBeVisible();
  });

  test('çekmeceden bir sayfaya gidilince otomatik kapanır', async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.locator('.app-navbar-menu-btn').click();

    const drawer = page.locator('.mobile-drawer');
    await drawer.getByText('Ayarlar').click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(drawer).not.toBeVisible();
  });

  test('mobil çekmeceden çıkış yapılabilir', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.locator('.app-navbar-menu-btn').click();
    await page.locator('.mobile-drawer').getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('tablolar mobilde kart görünümüne geçer', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/users');

    const table = page.getByTestId('users-table');
    await expect(table).toBeVisible();
    const box = await table.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
  });
});

test.describe('Masaüstü navigasyon', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('kenar çubuğu üzerine gelince genişler', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);

    const rail = page.locator('.sidebar-rail');
    await expect(rail).toBeVisible();
    await expect(rail).not.toHaveClass(/sidebar-rail-open/);

    await rail.hover();
    await expect(rail).toHaveClass(/sidebar-rail-open/);

    await page.locator('.app-navbar-logo').hover();
    await expect(rail).not.toHaveClass(/sidebar-rail-open/);
  });

  test('kenar çubuğundan çıkış yapılabilir', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logo tıklanınca varsayılan rotaya gider', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/settings');
    await page.locator('.app-navbar-logo-link').click();
    await expect(page).toHaveURL(/\/leave-requests$/);
  });
});
