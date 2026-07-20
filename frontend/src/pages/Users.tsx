import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { Modal } from '../components/Modal';
import { EditUserModal } from '../components/EditUserModal';
import {
  BanIcon,
  CheckCircleIcon,
  KeyIcon,
  PencilIcon,
  RefreshIcon,
} from '../components/layout/icons';
import {
  activateUser,
  deactivateUser,
  fetchAllUsers,
  resetUserBalance,
  resetUserPassword,
} from '../api/users';
import { getApiErrorMessage } from '../api/client';
import { formatDateTR } from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { User } from '../api/types';

export function Users() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const [balanceTarget, setBalanceTarget] = useState<Omit<
    User,
    'password'
  > | null>(null);
  const [isResettingBalance, setIsResettingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [statusTarget, setStatusTarget] = useState<Omit<
    User,
    'password'
  > | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Omit<
    User,
    'password'
  > | null>(null);

  useEffect(() => {
    fetchAllUsers().then(setUsers);
  }, []);

  async function handleResetPassword(id: string) {
    setResetError(null);
    setResettingId(id);
    try {
      const { newPassword: password } = await resetUserPassword(id);
      setNewPassword(password);
      toast.success(t('users.resetPasswordSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t('users.resetPasswordError'));
      setResetError(message);
      toast.error(message);
    } finally {
      setResettingId(null);
    }
  }

  async function handleConfirmResetBalance() {
    if (!balanceTarget) {
      return;
    }
    setBalanceError(null);
    setIsResettingBalance(true);
    try {
      const updated = await resetUserBalance(balanceTarget.id);
      setUsers((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user)),
      );
      setBalanceTarget(null);
      toast.success(t('users.resetBalanceSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t('users.resetBalanceError'));
      setBalanceError(message);
      toast.error(message);
    } finally {
      setIsResettingBalance(false);
    }
  }

  async function handleConfirmToggleStatus() {
    if (!statusTarget) {
      return;
    }
    setStatusError(null);
    setIsUpdatingStatus(true);
    try {
      const wasActive = statusTarget.isActive;
      const updated = wasActive
        ? await deactivateUser(statusTarget.id)
        : await activateUser(statusTarget.id);
      setUsers((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user)),
      );
      setStatusTarget(null);
      toast.success(
        t(wasActive ? 'users.deactivateSuccess' : 'users.activateSuccess'),
      );
    } catch (err) {
      const message = getApiErrorMessage(err, t('users.statusUpdateError'));
      setStatusError(message);
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <AppLayout>
      <h1>{t('nav.users')}</h1>
      {resetError && <p className="form-error">{resetError}</p>}

      {balanceTarget && (
        <Modal
          title={t('users.resetBalanceTitle')}
          onClose={() => setBalanceTarget(null)}
          closeLabel={t('common.close')}
        >
          <p className="modal-subtitle">
            {t('users.resetBalanceSubtitle', {
              name: `${balanceTarget.firstName} ${balanceTarget.lastName}`,
              count: balanceTarget.defaultAnnualLeaveBalance,
            })}
          </p>
          {balanceError && <p className="form-error">{balanceError}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setBalanceTarget(null)}
              disabled={isResettingBalance}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleConfirmResetBalance}
              disabled={isResettingBalance}
              data-testid="reset-balance-confirm"
            >
              {t('common.confirm')}
            </button>
          </div>
        </Modal>
      )}

      {statusTarget && (
        <Modal
          title={
            statusTarget.isActive
              ? t('users.deactivateTitle')
              : t('users.activateTitle')
          }
          onClose={() => setStatusTarget(null)}
          closeLabel={t('common.close')}
        >
          <p className="modal-subtitle">
            {t(
              statusTarget.isActive
                ? 'users.deactivateSubtitle'
                : 'users.activateSubtitle',
              {
                name: `${statusTarget.firstName} ${statusTarget.lastName}`,
              },
            )}
          </p>
          {statusError && <p className="form-error">{statusError}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStatusTarget(null)}
              disabled={isUpdatingStatus}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className={
                statusTarget.isActive ? 'btn btn-danger' : 'btn'
              }
              onClick={handleConfirmToggleStatus}
              disabled={isUpdatingStatus}
              data-testid="status-confirm"
            >
              {t('common.confirm')}
            </button>
          </div>
        </Modal>
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            setUsers((prev) =>
              prev.map((user) => (user.id === updated.id ? updated : user)),
            );
            setEditTarget(null);
            toast.success(t('users.editSuccess'));
          }}
        />
      )}

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
                <th>{t('leaves.defaultAnnualBalanceShort')}</th>
                <th>{t('leaves.remainingAnnualBalanceShort')}</th>
                <th>{t('users.status')}</th>
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
                  <td>{user.defaultAnnualLeaveBalance}</td>
                  <td>{user.annualLeaveBalance}</td>
                  <td>
                    <span
                      className={`badge badge-${user.isActive ? 'ACTIVE' : 'INACTIVE'}`}
                      data-testid={`status-badge-${user.id}`}
                    >
                      {t(user.isActive ? 'users.active' : 'users.inactive')}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-cell-inner">
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain"
                        onClick={() => setEditTarget(user)}
                        aria-label={t('common.edit')}
                        data-tooltip={t('common.edit')}
                        data-testid={`edit-user-${user.id}`}
                      >
                        <PencilIcon />
                      </button>
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
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain"
                        onClick={() => setBalanceTarget(user)}
                        aria-label={t('users.resetBalance')}
                        data-tooltip={t('users.resetBalance')}
                        data-testid={`reset-balance-${user.id}`}
                      >
                        <RefreshIcon />
                      </button>
                      {currentUser?.id !== user.id && (
                        <button
                          type="button"
                          className="icon-btn icon-btn-plain"
                          onClick={() => setStatusTarget(user)}
                          aria-label={t(
                            user.isActive
                              ? 'users.deactivate'
                              : 'users.activate',
                          )}
                          data-tooltip={t(
                            user.isActive
                              ? 'users.deactivate'
                              : 'users.activate',
                          )}
                          data-testid={`toggle-status-${user.id}`}
                        >
                          {user.isActive ? <BanIcon /> : <CheckCircleIcon />}
                        </button>
                      )}
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
