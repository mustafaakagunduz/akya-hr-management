import { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

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

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const rawDigits = event.target.value.replace(/\D/g, '').slice(0, 8);
    setDigits(rawDigits);
    onChange(digitsToIso(rawDigits));
  }

  const incompleteError =
    touched && digits.length > 0 && digits.length < 8
      ? t('validation.incompleteDate')
      : undefined;
  const displayError = error ?? incompleteError;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="GG.AA.YYYY"
        value={digitsToFormatted(digits)}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        maxLength={10}
        required={required}
        data-testid={testId}
      />
      {displayError && <span className="field-error">{displayError}</span>}
    </div>
  );
}
