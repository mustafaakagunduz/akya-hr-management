import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { MenuIcon } from './icons';

interface NavbarProps {
  onMenuOpen: () => void;
}

export function Navbar({ onMenuOpen }: NavbarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <img src="/akya-logo.png" alt={t('app.title')} className="app-navbar-logo" />
        <span className="app-navbar-user">
          {user ? `${user.firstName} ${user.lastName}` : ''}
        </span>
        <button
          type="button"
          className="app-navbar-menu-btn"
          onClick={onMenuOpen}
          aria-label={t('nav.openMenu')}
        >
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}
