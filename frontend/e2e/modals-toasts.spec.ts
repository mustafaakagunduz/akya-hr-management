import { test, expect } from '@playwright/test';
import {
  ADMIN,
  DESKTOP_VIEWPORT,
  login,
  registerEmployee,
  uniqueEmployeeData,
} from './helpers';

test.use({ viewport: DESKTOP_VIEWPORT });

test.describe('İzin talebi oluşturma - onay modalı', () => {
  test('modal doğru bilgileri gösterir, vazgeç ile kapanır, onayla ile talep oluşturur ve toast gösterir', async ({
    page,
  }) => {
    const employee = uniqueEmployeeData();
    await registerEmployee(page, employee);
    await login(page, employee.email, employee.password);

    await page.goto('/create-leave');
    await page.getByTestId('leave-type').selectOption('DAILY');
    await page.getByTestId('leave-start-date').fill('20092026');
    await page.keyboard.press('Escape');
    await page.getByTestId('leave-description').fill('Diş hekimi randevusu');
    await page.getByTestId('leave-submit').click();

    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toHaveText('İzin Talebini Onayla');
    await expect(modal).toContainText('20.09.2026');

    await modal.getByRole('button', { name: 'Vazgeç' }).click();
    await expect(modal).not.toBeVisible();
    await expect(page.getByTestId('leave-create-success')).not.toBeVisible();

    await page.getByTestId('leave-submit').click();
    await expect(modal).toBeVisible();
    await page.getByTestId('leave-confirm-submit').click();

    await expect(page.getByTestId('leave-create-success')).toBeVisible();
    const toast = page.getByTestId('toast-success');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('role', 'status');
    await expect(toast).toContainText('İzin talebiniz oluşturuldu');
  });
});

test.describe('Taleplerim - düzenleme ve silme modalları', () => {
  test('bekleyen talep düzenlenebilir ve silinebilir, her ikisinde de toast görünür', async ({
    page,
  }) => {
    const employee = uniqueEmployeeData();
    await registerEmployee(page, employee);
    await login(page, employee.email, employee.password);

    await page.goto('/create-leave');
    await page.getByTestId('leave-type').selectOption('DAILY');
    await page.getByTestId('leave-start-date').fill('21092026');
    await page.keyboard.press('Escape');
    await page.getByTestId('leave-submit').click();
    await page.getByTestId('leave-confirm-submit').click();
    await expect(page.getByTestId('leave-create-success')).toBeVisible();

    await page.goto('/my-leaves');
    const row = page.getByTestId('my-requests-table').locator('tbody tr').first();
    await row.locator('[data-testid^="leave-edit-"]').click();

    const editModal = page.locator('.modal');
    await expect(editModal).toBeVisible();
    await expect(editModal.locator('h2')).toHaveText('İzin Talebini Düzenle');
    await editModal.getByTestId('leave-edit-description').fill('Güncellenmiş açıklama');
    await editModal.getByTestId('leave-edit-submit').click();

    await expect(editModal).not.toBeVisible();
    await expect(page.getByTestId('toast-success').last()).toContainText(
      'İzin talebiniz güncellendi',
    );
    await expect(row).toContainText('Güncellenmiş açıklama');

    await row.locator('[data-testid^="leave-delete-"]').click();
    const deleteModal = page.locator('.modal');
    await expect(deleteModal).toBeVisible();
    await expect(deleteModal.locator('h2')).toHaveText('İzin Talebini Sil');

    await deleteModal.getByRole('button', { name: 'Vazgeç' }).click();
    await expect(deleteModal).not.toBeVisible();
    await expect(row).toBeVisible();

    await row.locator('[data-testid^="leave-delete-"]').click();
    await page.getByTestId('leave-delete-confirm').click();
    await expect(page.getByTestId('toast-success').last()).toContainText(
      'İzin talebiniz silindi',
    );
    await expect(page.getByTestId('my-requests-table')).not.toBeVisible();
  });
});

test.describe('Kullanıcılar sayfası - yönetici modalları', () => {
  test('kullanıcı düzenlenebilir, şifre sıfırlanabilir ve durum değiştirilebilir', async ({
    page,
  }) => {
    const employee = uniqueEmployeeData();
    await registerEmployee(page, employee);

    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/users');
    await page.getByTestId('users-search').fill(employee.lastName);

    const row = page.getByTestId('user-row').first();
    await expect(row).toBeVisible();

    await row.locator('[data-testid^="edit-user-"]').click();
    const editModal = page.locator('.modal');
    await expect(editModal).toBeVisible();
    await expect(editModal.locator('h2')).toHaveText('Kullanıcıyı Düzenle');
    await editModal.getByTestId('edit-user-phone').fill('5559998877');
    await editModal.getByTestId('edit-user-submit').click();

    await expect(editModal).not.toBeVisible();
    await expect(page.getByTestId('toast-success').last()).toContainText(
      'Kullanıcı bilgileri güncellendi',
    );
    await expect(row).toContainText('5559998877');

    await row.locator('[data-testid^="reset-password-"]').click();
    const resetModal = page.locator('.modal');
    await expect(resetModal).toBeVisible();
    await resetModal.getByTestId('reset-password-confirm').click();

    const newPasswordModal = page.locator('.modal');
    await expect(newPasswordModal).toBeVisible();
    await expect(page.getByTestId('new-password-display')).not.toBeEmpty();
    await expect(page.getByTestId('toast-success').last()).toContainText(
      'Kullanıcının şifresi sıfırlandı',
    );
    await newPasswordModal.locator('.modal-actions').getByRole('button', { name: 'Kapat' }).click();
    await expect(newPasswordModal).not.toBeVisible();

    await row.locator('[data-testid^="toggle-status-"]').click();
    const statusModal = page.locator('.modal');
    await expect(statusModal).toBeVisible();
    await expect(statusModal.locator('h2')).toHaveText('Hesabı Pasifleştir');
    await statusModal.getByTestId('status-confirm').click();

    await expect(statusModal).not.toBeVisible();
    await expect(row.locator('[data-testid^="status-badge-"]')).toHaveText(
      'Pasif',
    );

    await row.locator('[data-testid^="toggle-status-"]').click();
    await page.getByTestId('status-confirm').click();
    await expect(row.locator('[data-testid^="status-badge-"]')).toHaveText(
      'Aktif',
    );
  });
});

test.describe('Toast bildirimleri', () => {
  test('hata toastı ve manuel kapatma çalışır', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill('olmayan.kullanici@sirket.com');
    await page.getByTestId('login-password').fill('YanlisSifre1');
    await page.getByTestId('login-submit').click();

    const toast = page.getByTestId('toast-error');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('role', 'status');

    await toast.locator('.toast-close').click();
    await expect(toast).not.toBeVisible();
  });

  test('başarı toastı belirli süre sonra otomatik kaybolur', async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    const toast = page.getByTestId('toast-success');
    await expect(toast).toBeVisible();
    await expect(toast).not.toBeVisible({ timeout: 6000 });
  });
});
