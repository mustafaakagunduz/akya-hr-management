import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { Modal } from '../components/Modal';
import { KeyIcon } from '../components/layout/icons';
import { fetchAllUsers, resetUserPassword } from '../api/users';
import { getApiErrorMessage } from '../api/client';
import { formatDateTR } from '../utils/date';
import type { User } from '../api/types';

export function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchAllUsers().then(setUsers);
  }, []);

  async function handleResetPassword(id: string) {
    setResetError(null);
    setResettingId(id);
    try {
      const { newPassword: password } = await resetUserPassword(id);
      setNewPassword(password);
    } catch (err) {
      setResetError(getApiErrorMessage(err, t('users.resetPasswordError')));
    } finally {
      setResettingId(null);
    }
  }

  return (
    <AppLayout>
      <h1>{t('nav.users')}</h1>
      {resetError && <p className="form-error">{resetError}</p>}

      {newPassword && (
        <Modal
          title={t('users.resetPasswordTitle')}
          onClose={() => setNewPassword(null)}
          closeLabel={t('common.close')}
        >
          <p className="modal-subtitle">{t('users.resetPasswordSubtitle')}</p>
          <span
            className="new-password-display"
            data-testid="new-password-display"
          >
            {newPassword}
          </span>
          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setNewPassword(null)}
            >
              {t('common.close')}
            </button>
          </div>
        </Modal>
      )}

      <div className="section">
        {users.length === 0 ? (
          <p className="muted">{t('users.noUsers')}</p>
        ) : (
          <table data-testid="users-table">
            <thead>
              <tr>
                <th>{t('auth.register.firstName')}</th>
                <th>{t('auth.register.lastName')}</th>
                <th>{t('auth.register.email')}</th>
                <th>{t('auth.register.phone')}</th>
                <th>{t('auth.register.department')}</th>
                <th>{t('auth.register.position')}</th>
                <th>{t('profile.role')}</th>
                <th>{t('auth.register.startDate')}</th>
                <th>{t('leaves.annualBalanceShort')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} data-testid="user-row">
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{t(`options.department.${user.department}`)}</td>
                  <td>{t(`options.position.${user.position}`)}</td>
                  <td>{t(`profile.roles.${user.role}`)}</td>
                  <td>{formatDateTR(user.startDate)}</td>
                  <td>{user.annualLeaveBalance}</td>
                  <td className="actions-cell">
                    <div className="actions-cell-inner">
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain"
                        onClick={() => handleResetPassword(user.id)}
                        disabled={resettingId === user.id}
                        aria-label={t('users.resetPassword')}
                        data-tooltip={t('users.resetPassword')}
                        data-testid={`reset-password-${user.id}`}
                      >
                        <KeyIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
