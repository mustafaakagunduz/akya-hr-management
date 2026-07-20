import { test, expect } from '@playwright/test';
import {
  ADMIN,
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  collectPageErrors,
  hasNoHorizontalOverflow,
  login,
  setPreferences,
  type Language,
  type ThemePreference,
} from './helpers';

const HEADINGS: Record<Language, Record<string, string>> = {
  tr: {
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    myLeaves: 'Bekleyen İzin Taleplerim',
    createLeave: 'İzin Talebi Oluştur',
    leaveRequests: 'İzin Yönetimi',
    leaveHistory: 'Geçmiş İzinler',
    users: 'Kullanıcılar',
    settings: 'Ayarlar',
    profile: 'Profil',
  },
  en: {
    login: 'Log In',
    register: 'Sign Up',
    myLeaves: 'My Pending Leave Requests',
    createLeave: 'Create Leave Request',
    leaveRequests: 'Leave Management',
    leaveHistory: 'Leave History',
    users: 'Users',
    settings: 'Settings',
    profile: 'Profile',
  },
};

const VIEWPORTS = [
  { name: 'desktop', viewport: DESKTOP_VIEWPORT },
  { name: 'mobile', viewport: MOBILE_VIEWPORT },
] as const;

const THEMES: ThemePreference[] = ['light', 'dark'];
const LANGS: Language[] = ['tr', 'en'];

for (const { name: viewportName, viewport } of VIEWPORTS) {
  for (const theme of THEMES) {
    for (const lang of LANGS) {
      test.describe(`matrix ${viewportName} / ${theme} / ${lang}`, () => {
        test.use({ viewport });

        test('login sayfası temayı ve dili doğru uygular', async ({
          page,
        }) => {
          await setPreferences(page, theme, lang);
          const errors = collectPageErrors(page);
          await page.goto('/login');

          await expect(page.locator('html')).toHaveAttribute(
            'data-theme',
            theme,
          );
          await expect(page.locator('html')).toHaveAttribute('lang', lang);
          await expect(page.getByTestId('login-card').locator('h1')).toHaveText(
            HEADINGS[lang].login,
          );
          await expect(page.getByTestId('demo-credentials')).toBeVisible();
          expect(await hasNoHorizontalOverflow(page)).toBe(true);
          expect(errors).toEqual([]);
        });

        test('register sayfası temayı ve dili doğru uygular', async ({
          page,
        }) => {
          await setPreferences(page, theme, lang);
          const errors = collectPageErrors(page);
          await page.goto('/register');

          await expect(page.locator('html')).toHaveAttribute(
            'data-theme',
            theme,
          );
          await expect(
            page.getByTestId('register-card').locator('h1'),
          ).toHaveText(HEADINGS[lang].register);
          expect(await hasNoHorizontalOverflow(page)).toBe(true);
          expect(errors).toEqual([]);
        });

        test('yönetici panel sayfaları temayı, dili ve düzeni doğru gösterir', async ({
          page,
        }) => {
          await setPreferences(page, theme, lang);
          const errors = collectPageErrors(page);
          await login(page, ADMIN.email, ADMIN.password);

          const managerPages: {
            path: string;
            heading: keyof (typeof HEADINGS)['tr'];
          }[] = [
            { path: '/leave-requests', heading: 'leaveRequests' },
            { path: '/leave-history', heading: 'leaveHistory' },
            { path: '/users', heading: 'users' },
            { path: '/settings', heading: 'settings' },
            { path: '/profile', heading: 'profile' },
          ];

          for (const { path, heading } of managerPages) {
            await page.goto(path);
            await expect(page.locator('html')).toHaveAttribute(
              'data-theme',
              theme,
            );
            await expect(page.locator('main h1')).toHaveText(
              HEADINGS[lang][heading],
            );
            expect(await hasNoHorizontalOverflow(page)).toBe(true);

            if (viewportName === 'mobile') {
              await expect(
                page.locator('.app-navbar-menu-btn'),
              ).toBeVisible();
            } else {
              await expect(page.locator('.sidebar-rail')).toBeVisible();
            }
          }

          expect(errors).toEqual([]);
        });
      });
    }
  }
}

test.describe('Ayarlar sayfasından canlı tema/dil değişimi', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('tema seçici değişince arayüz anında koyu/açık moda geçer', async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/settings');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByTestId('theme-select').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByTestId('theme-select').selectOption('light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('dil seçici değişince tüm metinler anında güncellenir', async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto('/settings');

    await expect(page.locator('main h1')).toHaveText('Ayarlar');
    await page.getByTestId('language-select').selectOption('en');
    await expect(page.locator('main h1')).toHaveText('Settings');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.goto('/leave-requests');
    await expect(page.locator('main h1')).toHaveText('Leave Management');

    await page.goto('/settings');
    await page.getByTestId('language-select').selectOption('tr');
    await expect(page.locator('main h1')).toHaveText('Ayarlar');
  });
});
