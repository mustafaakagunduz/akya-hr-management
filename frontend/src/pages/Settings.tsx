import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import type { Language } from '../i18n';

const THEME_VALUES: ThemePreference[] = ['light', 'dark', 'system'];
const LANGUAGE_VALUES: Language[] = ['tr', 'en'];

export function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <AppLayout>
      <h1>{t('nav.settings')}</h1>
      <div className="profile-columns">
        <div className="section">
          <div className="card" data-testid="settings-card">
            <h2>{t('settings.appearance.title')}</h2>
            <div className="field">
              <label htmlFor="theme-select">
                {t('settings.appearance.themeLabel')}
              </label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemePreference)}
                data-testid="theme-select"
              >
                {THEME_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`settings.appearance.theme.${value}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="section">
          <div className="card" data-testid="language-card">
            <h2>{t('settings.language.title')}</h2>
            <div className="field">
              <label htmlFor="language-select">
                {t('settings.language.label')}
              </label>
              <select
                id="language-select"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value as Language)}
                data-testid="language-select"
              >
                {LANGUAGE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`settings.language.options.${value}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
