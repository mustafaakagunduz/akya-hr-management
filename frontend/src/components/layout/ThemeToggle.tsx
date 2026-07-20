import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { SunMoonIcon } from './icons';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t(isDark ? 'nav.themeToggle.toLight' : 'nav.themeToggle.toDark')}
      data-theme-toggle={resolvedTheme}
    >
      <SunMoonIcon className="theme-toggle-icon" />
    </button>
  );
}
