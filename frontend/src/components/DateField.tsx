import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
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
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!calendarOpen) {
      return;
    }
    function updatePosition() {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward =
        popoverHeight > 0 &&
        spaceBelow < popoverHeight + 12 &&
        rect.top > popoverHeight + 12;
      const top = openUpward
        ? rect.top - popoverHeight - 6
        : rect.bottom + 6;
      setCalendarPosition({ top, left: rect.left });
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [calendarOpen]);

  useEffect(() => {
    if (!calendarOpen) {
      return;
    }
    function handleFocusIn(event: FocusEvent) {
      const target = event.target as Node;
      if (
        wrapRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setCalendarOpen(false);
    }
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [calendarOpen]);

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
      <div className="date-field-input-wrap" ref={wrapRef}>
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
        {calendarOpen &&
          createPortal(
            <div
              ref={popoverRef}
              className="date-field-calendar-portal"
              style={{
                top: calendarPosition.top,
                left: calendarPosition.left,
              }}
            >
              <Calendar
                value={digitsToIso(digits)}
                onSelect={handleCalendarSelect}
                onClose={() => setCalendarOpen(false)}
              />
            </div>,
            document.body,
          )}
      </div>
      {displayError && <span className="field-error">{displayError}</span>}
    </div>
  );
}
