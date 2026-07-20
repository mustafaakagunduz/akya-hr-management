import { test, expect } from '@playwright/test';
import { ADMIN, registerEmployee, uniqueEmployeeData } from './helpers';

const employee = uniqueEmployeeData();

const ADMIN_EMAIL = ADMIN.email;
const ADMIN_PASSWORD = ADMIN.password;

test.describe.serial('İK izin yönetim akışı', () => {
  test('personel kayıt olabilir', async ({ page }) => {
    await registerEmployee(page, employee);
  });

  test('personel giriş yapıp izin talebi oluşturabilir', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(employee.email);
    await page.getByTestId('login-password').fill(employee.password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/my-leaves$/);
    await expect(page.getByTestId('annual-balance')).toContainText('14');

    await page.goto('/create-leave');
    await page.getByTestId('leave-type').selectOption('DAILY');
    await page.getByTestId('leave-start-date').fill('20082026');
    await page.keyboard.press('Escape');
    await page.getByTestId('leave-description').fill('Doktor randevusu');
    await page.getByTestId('leave-submit').click();
    await page.getByTestId('leave-confirm-submit').click();

    await expect(page.getByTestId('leave-create-success')).toBeVisible();

    await page.goto('/my-leaves');
    const row = page.getByTestId('my-requests-table').locator('tbody tr').first();
    await expect(row).toContainText('Günlük');
    await expect(row.getByTestId('status-badge-PENDING')).toBeVisible();

    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('yönetici bekleyen talebi onaylayabilir', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(ADMIN_EMAIL);
    await page.getByTestId('login-password').fill(ADMIN_PASSWORD);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/leave-requests$/);

    const row = page.getByTestId('pending-row').filter({
      hasText: employee.lastName,
    });
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: 'Onayla' }).click();
    await expect(page.getByTestId('manager-action-message')).toBeVisible();
    await expect(row).toHaveCount(0);

    await page.getByTestId('logout-button').click();
  });

  test('personel onaylanan talebi görebilir', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(employee.email);
    await page.getByTestId('login-password').fill(employee.password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/my-leaves$/);
    const row = page.getByTestId('my-requests-table').locator('tbody tr').first();
    await expect(row.getByTestId('status-badge-APPROVED')).toBeVisible();
  });
});
