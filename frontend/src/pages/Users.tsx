import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { SectionLoading } from '../components/SectionLoading';
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
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [resetPasswordTarget, setResetPasswordTarget] = useState<Omit<
    User,
    'password'
  > | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
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
    fetchAllUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, []);

  const normalizedSearch = search.trim().toLocaleLowerCase('tr');
  const filteredUsers = (
    normalizedSearch
      ? users.filter((user) =>
          `${user.firstName} ${user.lastName}`
            .toLocaleLowerCase('tr')
            .includes(normalizedSearch),
        )
      : users
  ).slice().sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(
      `${b.firstName} ${b.lastName}`,
      'tr',
    ),
  );

  async function handleConfirmResetPassword() {
    if (!resetPasswordTarget) {
      return;
    }
    setResetError(null);
    setIsResettingPassword(true);
    try {
      const { newPassword: password } = await resetUserPassword(
        resetPasswordTarget.id,
      );
      setResetPasswordTarget(null);
      setNewPassword(password);
      toast.success(t('users.resetPasswordSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t, t('users.resetPasswordError'));
      setResetError(message);
      toast.error(message);
    } finally {
      setIsResettingPassword(false);
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
      const message = getApiErrorMessage(err, t, t('users.resetBalanceError'));
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
      const message = getApiErrorMessage(err, t, t('users.statusUpdateError'));
      setStatusError(message);
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <AppLayout>
      <h1>{t('nav.users')}</h1>

      <input
        type="text"
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('users.searchPlaceholder')}
        aria-label={t('users.searchPlaceholder')}
        data-testid="users-search"
      />

      {resetPasswordTarget && (
        <Modal
          title={t('users.resetPasswordConfirmTitle')}
          onClose={() => setResetPasswordTarget(null)}
          closeLabel={t('common.close')}
        >
          <p className="modal-subtitle">
            {t('users.resetPasswordConfirmSubtitle', {
              name: `${resetPasswordTarget.firstName} ${resetPasswordTarget.lastName}`,
            })}
          </p>
          {resetError && <p className="form-error">{resetError}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setResetPasswordTarget(null)}
              disabled={isResettingPassword}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmResetPassword}
              disabled={isResettingPassword}
              data-testid="reset-password-confirm"
            >
              {t('common.confirm')}
            </button>
          </div>
        </Modal>
      )}

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
        {isLoading ? (
          <SectionLoading />
        ) : filteredUsers.length === 0 ? (
          <p className="muted">
            {users.length === 0
              ? t('users.noUsers')
              : t('users.noSearchResults')}
          </p>
        ) : (
          <table className="table-responsive" data-testid="users-table">
            <thead>
              <tr>
                <th>{t('users.fullName')}</th>
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
              {filteredUsers.map((user) => (
                <tr key={user.id} data-testid="user-row">
                  <td data-label={t('users.fullName')}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td data-label={t('auth.register.email')}>{user.email}</td>
                  <td data-label={t('auth.register.phone')}>{user.phone}</td>
                  <td data-label={t('auth.register.department')}>
                    {t(`options.department.${user.department}`)}
                  </td>
                  <td data-label={t('auth.register.position')}>
                    {t(`options.position.${user.position}`)}
                  </td>
                  <td data-label={t('profile.role')}>
                    {t(`profile.roles.${user.role}`)}
                  </td>
                  <td data-label={t('auth.register.startDate')}>
                    {formatDateTR(user.startDate)}
                  </td>
                  <td data-label={t('leaves.defaultAnnualBalanceShort')}>
                    {user.defaultAnnualLeaveBalance}
                  </td>
                  <td data-label={t('leaves.remainingAnnualBalanceShort')}>
                    {user.annualLeaveBalance}
                  </td>
                  <td data-label={t('users.status')}>
                    <span
                      className={`badge badge-${user.isActive ? 'ACTIVE' : 'INACTIVE'}`}
                      data-testid={`status-badge-${user.id}`}
                    >
                      {t(user.isActive ? 'users.active' : 'users.inactive')}
                    </span>
                  </td>
                  <td className="actions-cell" data-label={t('common.actions')}>
                    <div className="actions-cell-inner accent-actions-inner users-actions-align">
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain accent-icon-btn"
                        onClick={() => setEditTarget(user)}
                        aria-label={t('common.edit')}
                        data-tooltip={t('common.edit')}
                        data-testid={`edit-user-${user.id}`}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain accent-icon-btn warning-icon-btn"
                        onClick={() => setResetPasswordTarget(user)}
                        aria-label={t('users.resetPassword')}
                        data-tooltip={t('users.resetPassword')}
                        data-testid={`reset-password-${user.id}`}
                      >
                        <KeyIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain accent-icon-btn approve-icon-btn"
                        onClick={() => setBalanceTarget(user)}
                        aria-label={t('users.resetBalance')}
                        data-tooltip={t('users.resetBalance')}
                        data-testid={`reset-balance-${user.id}`}
                      >
                        <RefreshIcon />
                      </button>
                      <button
                        type="button"
                        className={`icon-btn icon-btn-plain accent-icon-btn ${
                          currentUser?.id === user.id
                            ? 'self-disabled-icon-btn'
                            : user.isActive
                              ? 'reject-icon-btn'
                              : 'approve-icon-btn'
                        }`}
                        onClick={() => setStatusTarget(user)}
                        disabled={currentUser?.id === user.id}
                        aria-label={t(
                          currentUser?.id === user.id
                            ? 'users.cannotDeactivateSelf'
                            : user.isActive
                              ? 'users.deactivate'
                              : 'users.activate',
                        )}
                        data-tooltip={t(
                          currentUser?.id === user.id
                            ? 'users.cannotDeactivateSelf'
                            : user.isActive
                              ? 'users.deactivate'
                              : 'users.activate',
                        )}
                        data-testid={`toggle-status-${user.id}`}
                      >
                        {user.isActive ? <BanIcon /> : <CheckCircleIcon />}
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
