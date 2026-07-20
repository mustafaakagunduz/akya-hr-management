import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import { formatDateTR } from '../utils/date';
import type { Department, Position } from '../api/types';

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

export function Profile() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [department, setDepartment] = useState<Department>(
    user?.department ?? 'HR',
  );
  const [position, setPosition] = useState<Position>(
    user?.position ?? 'INTERN',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return null;
  }

  function startEditing() {
    setEmail(user!.email);
    setPhone(user!.phone);
    setDepartment(user!.department);
    setPosition(user!.position);
    setError(null);
    setIsEditing(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await updateProfile({ email, phone, department, position });
      await refreshUser();
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t('common.genericError'));
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppLayout>
      <h1>{t('nav.profile')}</h1>
      <div className="profile-columns">
      <div className="section">
        <form className="card" data-testid="profile-card" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <div className="modal-row">
            <span className="modal-row-label">
              {t('auth.register.firstName')}
            </span>
            <span className="modal-row-value">{user.firstName}</span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">
              {t('auth.register.lastName')}
            </span>
            <span className="modal-row-value">{user.lastName}</span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">
              {t('auth.register.nationalId')}
            </span>
            <span className="modal-row-value">{user.nationalId}</span>
          </div>

          <div className="modal-row">
            <span className="modal-row-label">{t('auth.register.email')}</span>
            {isEditing ? (
              <input
                type="email"
                className="profile-row-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="profile-email"
              />
            ) : (
              <span className="modal-row-value">{user.email}</span>
            )}
          </div>
          <div className="modal-row">
            <span className="modal-row-label">{t('auth.register.phone')}</span>
            {isEditing ? (
              <input
                type="text"
                className="profile-row-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="profile-phone"
              />
            ) : (
              <span className="modal-row-value">{user.phone}</span>
            )}
          </div>
          <div className="modal-row">
            <span className="modal-row-label">
              {t('auth.register.department')}
            </span>
            {isEditing ? (
              <select
                className="profile-row-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                data-testid="profile-department"
              >
                {DEPARTMENT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`options.department.${value}`)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="modal-row-value">
                {t(`options.department.${user.department}`)}
              </span>
            )}
          </div>
          <div className="modal-row">
            <span className="modal-row-label">
              {t('auth.register.position')}
            </span>
            {isEditing ? (
              <select
                className="profile-row-input"
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                data-testid="profile-position"
              >
                {POSITION_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`options.position.${value}`)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="modal-row-value">
                {t(`options.position.${user.position}`)}
              </span>
            )}
          </div>

          <div className="modal-row">
            <span className="modal-row-label">
              {t('auth.register.startDate')}
            </span>
            <span className="modal-row-value">
              {formatDateTR(user.startDate)}
            </span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">
              {t('auth.register.birthDate')}
            </span>
            <span className="modal-row-value">
              {formatDateTR(user.birthDate)}
            </span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">{t('profile.role')}</span>
            <span className="modal-row-value">
              {t(`profile.roles.${user.role}`)}
            </span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">
              {t('profile.defaultLeaveDays')}
            </span>
            <span className="modal-row-value">
              {user.defaultAnnualLeaveBalance}
            </span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">
              {t('profile.remainingLeaveDays')}
            </span>
            <span className="modal-row-value">
              {user.annualLeaveBalance}
            </span>
          </div>

          <div className="modal-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={isSaving}
                  data-testid="profile-save"
                >
                  {t('common.save')}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={startEditing}
                data-testid="profile-edit"
              >
                {t('common.edit')}
              </button>
            )}
          </div>
        </form>
      </div>

      <ChangePasswordForm />
      </div>
    </AppLayout>
  );
}
