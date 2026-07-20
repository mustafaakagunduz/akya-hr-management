import { test, expect } from '@playwright/test';

const unique = Date.now().toString().slice(-9);
const employee = {
  firstName: 'Test',
  lastName: `Personel${unique}`,
  nationalId: unique.padStart(11, '1'),
  email: `test.personel.${unique}@sirket.com`,
  phone: '5551234567',
  department: 'IT',
  position: 'Test Uzmanı',
  startDate: '2024-01-01',
  birthDate: '1996-06-15',
  password: 'Sifre123',
};

const ADMIN_EMAIL = 'admin@sirket.com';
const ADMIN_PASSWORD = 'Admin123!';

test.describe.serial('İK izin yönetim akışı', () => {
  test('personel kayıt olabilir', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('register-firstName').fill(employee.firstName);
    await page.getByTestId('register-lastName').fill(employee.lastName);
    await page.getByTestId('register-nationalId').fill(employee.nationalId);
    await page.getByTestId('register-email').fill(employee.email);
    await page.getByTestId('register-phone').fill(employee.phone);
    await page.getByTestId('register-department').fill(employee.department);
    await page.getByTestId('register-position').fill(employee.position);
    await page.getByTestId('register-startDate').fill(employee.startDate);
    await page.getByTestId('register-birthDate').fill(employee.birthDate);
    await page.getByTestId('register-password').fill(employee.password);
    await page.getByTestId('register-submit').click();

    await expect(page.getByTestId('register-success')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/, { timeout: 5000 });
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
    await page.getByTestId('leave-start-date').fill('2026-08-20');
    await page.getByTestId('leave-end-date').fill('2026-08-20');
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
