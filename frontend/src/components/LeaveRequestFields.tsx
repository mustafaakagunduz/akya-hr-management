import { useTranslation } from 'react-i18next';
import { DateField } from './DateField';
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

  function handleTypeChange(nextType: LeaveType) {
    onTypeChange(nextType);
    if (nextType === 'DAILY') {
      onEndDateChange(startDate);
    }
  }

  function handleDailyDateChange(value: string) {
    onStartDateChange(value);
    onEndDateChange(value);
  }

  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-type`}>{t('leaves.type.label')}</label>
        <select
          id={`${idPrefix}-type`}
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as LeaveType)}
          data-testid={`${testIdPrefix}-type`}
        >
          <option value="DAILY">{t('leaves.type.DAILY')}</option>
          <option value="ANNUAL">{t('leaves.type.ANNUAL')}</option>
        </select>
      </div>
      {type === 'DAILY' ? (
        <DateField
          id={`${idPrefix}-startDate`}
          label={t('leaves.date')}
          value={startDate}
          onChange={handleDailyDateChange}
          required
          testId={`${testIdPrefix}-start-date`}
        />
      ) : (
        <div className="form-grid">
          <DateField
            id={`${idPrefix}-startDate`}
            label={t('leaves.startDate')}
            value={startDate}
            onChange={onStartDateChange}
            required
            testId={`${testIdPrefix}-start-date`}
          />
          <DateField
            id={`${idPrefix}-endDate`}
            label={t('leaves.endDate')}
            value={endDate}
            onChange={onEndDateChange}
            required
            testId={`${testIdPrefix}-end-date`}
          />
        </div>
      )}
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
