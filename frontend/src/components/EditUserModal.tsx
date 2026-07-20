import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { DateField } from './DateField';
import { adminUpdateUser } from '../api/users';
import { getApiErrorMessage } from '../api/client';
import type {
  AdminUpdateUserPayload,
  Department,
  Position,
  User,
  UserRole,
} from '../api/types';

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

const ROLE_VALUES: UserRole[] = ['EMPLOYEE', 'MANAGER'];

interface EditUserModalProps {
  user: Omit<User, 'password'>;
  onClose: () => void;
  onSaved: (updated: Omit<User, 'password'>) => void;
}

export function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<AdminUpdateUserPayload>({
    firstName: user.firstName,
    lastName: user.lastName,
    nationalId: user.nationalId,
    email: user.email,
    phone: user.phone,
    department: user.department,
    position: user.position,
    startDate: user.startDate,
    birthDate: user.birthDate,
    role: user.role,
    annualLeaveBalance: user.defaultAnnualLeaveBalance,
  });
  const [balanceInput, setBalanceInput] = useState(
    String(user.defaultAnnualLeaveBalance),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update<K extends keyof AdminUpdateUserPayload>(
    key: K,
    value: AdminUpdateUserPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const updated = await adminUpdateUser(user.id, {
        ...form,
        annualLeaveBalance: Number(balanceInput) || 0,
      });
      onSaved(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={t('users.editTitle')}
      onClose={onClose}
      closeLabel={t('common.close')}
    >
      <form onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="edit-user-firstName">
              {t('auth.register.firstName')}
            </label>
            <input
              id="edit-user-firstName"
              type="text"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              required
              data-testid="edit-user-firstName"
            />
          </div>
          <div className="field">
            <label htmlFor="edit-user-lastName">
              {t('auth.register.lastName')}
            </label>
            <input
              id="edit-user-lastName"
              type="text"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              required
              data-testid="edit-user-lastName"
            />
          </div>
          <div className="field">
            <label htmlFor="edit-user-nationalId">
              {t('auth.register.nationalId')}
            </label>
            <input
              id="edit-user-nationalId"
              type="text"
              value={form.nationalId}
              onChange={(e) => update('nationalId', e.target.value)}
              maxLength={11}
              required
              data-testid="edit-user-nationalId"
            />
          </div>
          <div className="field">
            <label htmlFor="edit-user-email">{t('auth.register.email')}</label>
            <input
              id="edit-user-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              data-testid="edit-user-email"
            />
          </div>
          <div className="field">
            <label htmlFor="edit-user-phone">{t('auth.register.phone')}</label>
            <input
              id="edit-user-phone"
              type="text"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              required
              data-testid="edit-user-phone"
            />
          </div>
          <div className="field">
            <label htmlFor="edit-user-department">
              {t('auth.register.department')}
            </label>
            <select
              id="edit-user-department"
              value={form.department}
              onChange={(e) =>
                update('department', e.target.value as Department)
              }
              data-testid="edit-user-department"
            >
              {DEPARTMENT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`options.department.${value}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="edit-user-position">
              {t('auth.register.position')}
            </label>
            <select
              id="edit-user-position"
              value={form.position}
              onChange={(e) => update('position', e.target.value as Position)}
              data-testid="edit-user-position"
            >
              {POSITION_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`options.position.${value}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="edit-user-role">{t('users.editRole')}</label>
            <select
              id="edit-user-role"
              value={form.role}
              onChange={(e) => update('role', e.target.value as UserRole)}
              data-testid="edit-user-role"
            >
              {ROLE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`profile.roles.${value}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="edit-user-annualLeaveBalance">
              {t('users.editAnnualLeaveBalance')}
            </label>
            <input
              id="edit-user-annualLeaveBalance"
              type="text"
              inputMode="numeric"
              value={balanceInput}
              onChange={(e) =>
                setBalanceInput(e.target.value.replace(/\D/g, ''))
              }
              required
              data-testid="edit-user-annualLeaveBalance"
            />
          </div>
          <DateField
            id="edit-user-startDate"
            label={t('auth.register.startDate')}
            value={form.startDate}
            onChange={(v) => update('startDate', v)}
            required
            testId="edit-user-startDate"
          />
          <DateField
            id="edit-user-birthDate"
            label={t('auth.register.birthDate')}
            value={form.birthDate}
            onChange={(v) => update('birthDate', v)}
            required
            testId="edit-user-birthDate"
          />
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn"
            disabled={isSaving}
            data-testid="edit-user-submit"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
