import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../utils/routing';
import { MenuIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onMenuOpen: () => void;
}

export function Navbar({ onMenuOpen }: NavbarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link to={user ? getDefaultRoute(user) : '/login'} className="app-navbar-logo-link">
          <img src="/akya-logo.png" alt={t('app.title')} className="app-navbar-logo" />
        </Link>
        <div className="app-navbar-right">
          <ThemeToggle />
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
      </div>
    </header>
  );
}
