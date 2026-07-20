import { useTranslation } from 'react-i18next';
import type { Language } from '../../i18n';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language === 'tr';
  const target: Language = isTurkish ? 'en' : 'tr';

  return (
    <button
      type="button"
      className={['language-toggle-btn', className].filter(Boolean).join(' ')}
      onClick={() => i18n.changeLanguage(target)}
      aria-label={t('nav.languageToggle', { language: target.toUpperCase() })}
    >
      {target.toUpperCase()}
    </button>
  );
}
