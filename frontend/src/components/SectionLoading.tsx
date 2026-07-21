import { useTranslation } from 'react-i18next';

export function SectionLoading() {
  const { t } = useTranslation();

  return (
    <div className="section-loading">
      <span className="section-loading-spinner" aria-hidden="true" />
      <span>{t('common.loading')}</span>
    </div>
  );
}
