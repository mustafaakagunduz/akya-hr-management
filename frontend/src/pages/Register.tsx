import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import { DateField } from '../components/DateField';
import type { Department, Position, RegisterPayload } from '../api/types';

const DEPARTMENT_VALUES: Department[] = [
  'HR',
  'SOFTWARE',
  'SALES',
  'MARKETING',
  'FINANCE',
  'OPERATIONS',
];

const POSITION_VALUES: Position[] = [
  'INTERN',
  'SPECIALIST',
  'TEAM_LEAD',
  'MANAGER',
  'DIRECTOR',
];

const EMPTY_FORM: RegisterPayload = {
  firstName: '',
  lastName: '',
  nationalId: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  startDate: '',
  birthDate: '',
  password: '',
};

type FieldErrors = Partial<Record<keyof RegisterPayload, string>>;

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterPayload>(EMPTY_FORM);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMismatch =
    passwordConfirm.length > 0 && form.password !== passwordConfirm;

  function update<K extends keyof RegisterPayload>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    const required: (keyof RegisterPayload)[] = [
      'firstName',
      'lastName',
      'nationalId',
      'email',
      'phone',
      'department',
      'position',
      'startDate',
      'birthDate',
      'password',
    ];
    for (const key of required) {
      if (!form[key]) {
        errors[key] = t('validation.required');
      }
    }
    if (!errors.nationalId && form.nationalId.length !== 11) {
      errors.nationalId = t('validation.nationalIdLength');
    }
    if (!errors.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = t('validation.invalidEmail');
    }
    if (!errors.password && form.password.length < 6) {
      errors.password = t('validation.minPasswordLength');
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || passwordMismatch || !passwordConfirm) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(form);
      setSuccess(true);
      setForm(EMPTY_FORM);
      setPasswordConfirm('');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-visual">
        <img src="/auth-bg.jpg" alt="" />
        <div className="auth-visual-overlay">
          <h2>{t('auth.visual.title')}</h2>
          <p>{t('auth.visual.subtitle')}</p>
        </div>
      </div>

      <div className="auth-form-panel wide">
      <div className="auth-card wide" data-testid="register-card">
        <h1>{t('auth.register.title')}</h1>
        <p className="auth-subtitle">{t('auth.register.subtitle')}</p>
        {submitError && <p className="form-error">{submitError}</p>}
        {success && (
          <p className="form-success" data-testid="register-success">
            {t('auth.register.success')}
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="email"
            label={t('auth.register.email')}
            type="email"
            value={form.email}
            onChange={(v) => update('email', v)}
            error={fieldErrors.email}
            hint={t('auth.register.emailHint')}
          />
          <TextField
            id="password"
            label={t('auth.register.password')}
            type="password"
            value={form.password}
            onChange={(v) => update('password', v)}
            error={fieldErrors.password}
          />
          <TextField
            id="passwordConfirm"
            label={t('auth.register.passwordConfirm')}
            type="password"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            error={passwordMismatch ? t('validation.passwordMismatch') : undefined}
          />
          <div className="form-grid">
            <TextField
              id="firstName"
              label={t('auth.register.firstName')}
              value={form.firstName}
              onChange={(v) => update('firstName', v)}
              error={fieldErrors.firstName}
            />
            <TextField
              id="lastName"
              label={t('auth.register.lastName')}
              value={form.lastName}
              onChange={(v) => update('lastName', v)}
              error={fieldErrors.lastName}
            />
            <DateField
              id="birthDate"
              label={t('auth.register.birthDate')}
              value={form.birthDate}
              onChange={(v) => update('birthDate', v)}
              error={fieldErrors.birthDate}
              required
              testId="register-birthDate"
            />
            <TextField
              id="nationalId"
              label={t('auth.register.nationalId')}
              value={form.nationalId}
              onChange={(v) => update('nationalId', v)}
              error={fieldErrors.nationalId}
              maxLength={11}
            />
            <TextField
              id="phone"
              label={t('auth.register.phone')}
              value={form.phone}
              onChange={(v) => update('phone', v)}
              error={fieldErrors.phone}
              placeholder="05XX XXX XX XX"
            />
            <SelectField
              id="department"
              label={t('auth.register.department')}
              value={form.department}
              onChange={(v) => update('department', v as Department)}
              error={fieldErrors.department}
              options={DEPARTMENT_VALUES.map((value) => ({
                value,
                label: t(`options.department.${value}`),
              }))}
            />
            <SelectField
              id="position"
              label={t('auth.register.position')}
              value={form.position}
              onChange={(v) => update('position', v as Position)}
              error={fieldErrors.position}
              options={POSITION_VALUES.map((value) => ({
                value,
                label: t(`options.position.${value}`),
              }))}
            />
            <DateField
              id="startDate"
              label={t('auth.register.startDate')}
              value={form.startDate}
              onChange={(v) => update('startDate', v)}
              error={fieldErrors.startDate}
              required
              testId="register-startDate"
            />
          </div>
          <button
            type="submit"
            className="btn"
            disabled={isSubmitting}
            data-testid="register-submit"
          >
            {t('auth.register.submit')}
          </button>
        </form>
        <p className="auth-switch">
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login">{t('auth.register.loginLink')}</Link>
        </p>
      </div>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  maxLength,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`register-${id}`}
      />
      {error && <span className="field-error">{error}</span>}
      {!error && hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  error,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: { value: string; label: string }[];
}) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`register-${id}`}
      >
        <option value="">{t('options.select')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
