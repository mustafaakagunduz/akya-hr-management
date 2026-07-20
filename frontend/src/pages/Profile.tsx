import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { formatDateTR } from '../utils/date';

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const rows: Array<[string, string]> = [
    [t('auth.register.firstName'), user.firstName],
    [t('auth.register.lastName'), user.lastName],
    [t('auth.register.nationalId'), user.nationalId],
    [t('auth.register.email'), user.email],
    [t('auth.register.phone'), user.phone],
    [t('auth.register.department'), t(`options.department.${user.department}`)],
    [t('auth.register.position'), t(`options.position.${user.position}`)],
    [t('auth.register.startDate'), formatDateTR(user.startDate)],
    [t('auth.register.birthDate'), formatDateTR(user.birthDate)],
    [t('profile.role'), t(`profile.roles.${user.role}`)],
  ];

  return (
    <AppLayout>
      <h1>{t('nav.profile')}</h1>
      <div className="section">
        <div className="card" data-testid="profile-card">
          {rows.map(([label, value]) => (
            <div className="modal-row" key={label}>
              <span className="modal-row-label">{label}</span>
              <span className="modal-row-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
