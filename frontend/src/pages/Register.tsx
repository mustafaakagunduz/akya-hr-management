import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import type { RegisterPayload } from '../api/types';

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(form);
      setSuccess(true);
      setForm(EMPTY_FORM);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card wide" data-testid="register-card">
        <h1>{t('auth.register.title')}</h1>
        {submitError && <p className="form-error">{submitError}</p>}
        {success && (
          <p className="form-success" data-testid="register-success">
            {t('auth.register.success')}
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate>
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
            <TextField
              id="nationalId"
              label={t('auth.register.nationalId')}
              value={form.nationalId}
              onChange={(v) => update('nationalId', v)}
              error={fieldErrors.nationalId}
              maxLength={11}
            />
            <TextField
              id="email"
              label={t('auth.register.email')}
              type="email"
              value={form.email}
              onChange={(v) => update('email', v)}
              error={fieldErrors.email}
            />
            <TextField
              id="phone"
              label={t('auth.register.phone')}
              value={form.phone}
              onChange={(v) => update('phone', v)}
              error={fieldErrors.phone}
            />
            <TextField
              id="department"
              label={t('auth.register.department')}
              value={form.department}
              onChange={(v) => update('department', v)}
              error={fieldErrors.department}
            />
            <TextField
              id="position"
              label={t('auth.register.position')}
              value={form.position}
              onChange={(v) => update('position', v)}
              error={fieldErrors.position}
            />
            <TextField
              id="startDate"
              label={t('auth.register.startDate')}
              type="date"
              value={form.startDate}
              onChange={(v) => update('startDate', v)}
              error={fieldErrors.startDate}
            />
            <TextField
              id="birthDate"
              label={t('auth.register.birthDate')}
              type="date"
              value={form.birthDate}
              onChange={(v) => update('birthDate', v)}
              error={fieldErrors.birthDate}
            />
            <TextField
              id="password"
              label={t('auth.register.password')}
              type="password"
              value={form.password}
              onChange={(v) => update('password', v)}
              error={fieldErrors.password}
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
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`register-${id}`}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
