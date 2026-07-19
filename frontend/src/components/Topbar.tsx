import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Topbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="topbar">
      <strong>{t('app.title')}</strong>
      <div className="topbar-links">
        <Link to="/panel">{t('nav.panel')}</Link>
        {user?.role === 'MANAGER' && (
          <Link to="/yonetici">{t('nav.manager')}</Link>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={logout}
          data-testid="logout-button"
        >
          {t('common.logout')}
        </button>
      </div>
    </div>
  );
}
