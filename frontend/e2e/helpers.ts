import { type Page, expect } from '@playwright/test';

export const ADMIN = { email: 'admin@sirket.com', password: 'Admin123!' };

export type ThemePreference = 'light' | 'dark' | 'system';
export type Language = 'tr' | 'en';

export async function setPreferences(
  page: Page,
  theme: ThemePreference,
  lang: Language,
) {
  await page.addInitScript(
    ([themeValue, langValue]) => {
      window.localStorage.setItem('theme', themeValue);
      window.localStorage.setItem('language', langValue);
    },
    [theme, lang],
  );
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-email')).not.toBeVisible();
}

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}

export async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth + 1,
  );
}

let counter = 0;

export function uniqueEmployeeData() {
  counter += 1;
  const unique = `${Date.now().toString().slice(-8)}${counter}`;
  return {
    firstName: 'Test',
    lastName: `UI${unique}`,
    nationalId: unique.padStart(11, '2').slice(0, 11),
    email: `ui.test.${unique}@sirket.com`,
    phone: '5551234567',
    department: 'SOFTWARE',
    position: 'SPECIALIST',
    startDate: '01012024',
    birthDate: '15061996',
    password: 'Sifre123',
  };
}

export async function registerEmployee(
  page: Page,
  employee: ReturnType<typeof uniqueEmployeeData>,
) {
  await page.goto('/register');
  await page.getByTestId('register-firstName').fill(employee.firstName);
  await page.getByTestId('register-lastName').fill(employee.lastName);
  await page.getByTestId('register-nationalId').fill(employee.nationalId);
  await page.getByTestId('register-email').fill(employee.email);
  await page.getByTestId('register-phone').fill(employee.phone);
  await page.getByTestId('register-department').selectOption(employee.department);
  await page.getByTestId('register-position').selectOption(employee.position);
  await page.getByTestId('register-startDate').fill(employee.startDate);
  await page.keyboard.press('Escape');
  await page.getByTestId('register-birthDate').fill(employee.birthDate);
  await page.keyboard.press('Escape');
  await page.getByTestId('register-password').fill(employee.password);
  await page.getByTestId('register-passwordConfirm').fill(employee.password);
  await page.getByTestId('register-submit').click();
  await expect(page.getByTestId('register-success')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/, { timeout: 5000 });
}

export const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
export const MOBILE_VIEWPORT = { width: 390, height: 844 };
