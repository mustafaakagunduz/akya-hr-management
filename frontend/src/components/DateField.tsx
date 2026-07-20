import { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from './Calendar';
import { CalendarIcon } from './layout/icons';

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (isoValue: string) => void;
  testId?: string;
  error?: string;
  required?: boolean;
}

function isoToDigits(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) {
    return '';
  }
  return `${day}${month}${year}`;
}

function digitsToFormatted(digits: string): string {
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  let formatted = day;
  if (month) {
    formatted += `.${month}`;
  }
  if (year) {
    formatted += `.${year}`;
  }
  return formatted;
}

function digitsToIso(digits: string): string {
  if (digits.length !== 8) {
    return '';
  }
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${year}-${month}-${day}`;
}

export function DateField({
  id,
  label,
  value,
  onChange,
  testId,
  error,
  required,
}: DateFieldProps) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState(() => isoToDigits(value));
  const [touched, setTouched] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const rawDigits = event.target.value.replace(/\D/g, '').slice(0, 8);
    setDigits(rawDigits);
    onChange(digitsToIso(rawDigits));
  }

  function handleCalendarSelect(isoValue: string) {
    setDigits(isoToDigits(isoValue));
    setTouched(true);
    onChange(isoValue);
    setCalendarOpen(false);
  }

  const incompleteError =
    touched && digits.length > 0 && digits.length < 8
      ? t('validation.incompleteDate')
      : undefined;
  const displayError = error ?? incompleteError;

  return (
    <div className="field date-field">
      <label htmlFor={id}>{label}</label>
      <div className="date-field-input-wrap">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder={t('validation.datePlaceholder')}
          value={digitsToFormatted(digits)}
          onChange={handleChange}
          onFocus={() => setCalendarOpen(true)}
          onBlur={() => setTouched(true)}
          maxLength={10}
          required={required}
          data-testid={testId}
          autoComplete="off"
        />
        <button
          type="button"
          className="date-field-icon-btn"
          onClick={() => setCalendarOpen((open) => !open)}
          aria-label={t('calendar.open')}
          tabIndex={-1}
        >
          <CalendarIcon />
        </button>
        {calendarOpen && (
          <Calendar
            value={digitsToIso(digits)}
            onSelect={handleCalendarSelect}
            onClose={() => setCalendarOpen(false)}
          />
        )}
      </div>
      {displayError && <span className="field-error">{displayError}</span>}
    </div>
  );
}
