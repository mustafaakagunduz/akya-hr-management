import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { changePassword } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export function ChangePasswordForm() {
  const { t } = useTranslation();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError(t('validation.minPasswordLength'));
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError(t('validation.passwordMismatch'));
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setSuccess(true);
      toast.success(t('profile.changePassword.success'));
    } catch (err) {
      const message = getApiErrorMessage(err, t('common.genericError'));
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="section">
      <form className="card" onSubmit={handleSubmit}>
        <h2>{t('profile.changePassword.title')}</h2>
        {error && <p className="form-error">{error}</p>}
        {success && (
          <p className="form-success">{t('profile.changePassword.success')}</p>
        )}
          <div className="field">
            <label htmlFor="current-password">
              {t('profile.changePassword.currentPassword')}
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              data-testid="profile-current-password"
            />
          </div>
          <div className="field">
            <label htmlFor="new-password">
              {t('profile.changePassword.newPassword')}
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-testid="profile-new-password"
            />
          </div>
          <div className="field">
            <label htmlFor="new-password-confirm">
              {t('profile.changePassword.newPasswordConfirm')}
            </label>
            <input
              id="new-password-confirm"
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              data-testid="profile-new-password-confirm"
            />
          </div>
        <div className="modal-actions">
          <button
            type="submit"
            className="btn"
            disabled={isSaving}
            data-testid="profile-change-password-submit"
          >
            {t('profile.changePassword.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
