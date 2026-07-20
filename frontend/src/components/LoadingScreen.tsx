import { useTranslation } from 'react-i18next';

export function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="loading-screen">
      <div className="loading-spinner" aria-hidden="true" />
      <span>{t('common.loading')}</span>
    </div>
  );
}
