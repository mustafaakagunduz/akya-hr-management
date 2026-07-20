import { useTranslation } from 'react-i18next';
import type { LeaveType } from '../api/types';

interface LeaveRequestFieldsProps {
  idPrefix: string;
  testIdPrefix: string;
  type: LeaveType;
  onTypeChange: (type: LeaveType) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function LeaveRequestFields({
  idPrefix,
  testIdPrefix,
  type,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  description,
  onDescriptionChange,
}: LeaveRequestFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-type`}>{t('leaves.type.label')}</label>
        <select
          id={`${idPrefix}-type`}
          value={type}
          onChange={(e) => onTypeChange(e.target.value as LeaveType)}
          data-testid={`${testIdPrefix}-type`}
        >
          <option value="DAILY">{t('leaves.type.DAILY')}</option>
          <option value="ANNUAL">{t('leaves.type.ANNUAL')}</option>
        </select>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`${idPrefix}-startDate`}>
            {t('leaves.startDate')}
          </label>
          <input
            id={`${idPrefix}-startDate`}
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
            data-testid={`${testIdPrefix}-start-date`}
          />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-endDate`}>{t('leaves.endDate')}</label>
          <input
            id={`${idPrefix}-endDate`}
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            required
            data-testid={`${testIdPrefix}-end-date`}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-description`}>
          {t('leaves.description')}
        </label>
        <textarea
          id={`${idPrefix}-description`}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          data-testid={`${testIdPrefix}-description`}
        />
      </div>
    </>
  );
}
