import { useTranslation } from 'react-i18next';
import type { Language } from '../../i18n';

interface LanguageToggleProps {
  className?: string;
  variant?: 'button' | 'switch';
}

export function LanguageToggle({
  className,
  variant = 'button',
}: LanguageToggleProps) {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language === 'tr';
  const target: Language = isTurkish ? 'en' : 'tr';

  if (variant === 'switch') {
    return (
      <button
        type="button"
        className={['lang-switch', className].filter(Boolean).join(' ')}
        onClick={() => i18n.changeLanguage(target)}
        aria-label={t('nav.languageToggle', { language: target.toUpperCase() })}
      >
        <span
          className={[
            'lang-switch-thumb',
            isTurkish ? '' : 'lang-switch-thumb--right',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
        <span
          className={[
            'lang-switch-option',
            isTurkish ? 'lang-switch-option--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          TR
        </span>
        <span
          className={[
            'lang-switch-option',
            isTurkish ? '' : 'lang-switch-option--active',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          EN
        </span>
      </button>
    );
  }

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
