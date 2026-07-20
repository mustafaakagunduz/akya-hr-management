import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { navItems } from './navItems';
import { LogoutIcon, CloseIcon } from './icons';

interface SidebarProps {
  railOpen: boolean;
  onRailOpenChange: (open: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  railOpen,
  onRailOpenChange,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <aside
        className={`sidebar-rail ${railOpen ? 'sidebar-rail-open' : ''}`}
        onMouseEnter={() => onRailOpenChange(true)}
        onMouseLeave={() => onRailOpenChange(false)}
      >
        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="sidebar-link sidebar-logout"
          onClick={logout}
          data-testid="logout-button"
        >
          <span className="sidebar-icon">
            <LogoutIcon />
          </span>
          <span className="sidebar-label">{t('common.logout')}</span>
        </button>
      </aside>

      <div
        className={`mobile-drawer-overlay ${mobileOpen ? 'mobile-drawer-overlay-open' : ''}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      {mobileOpen && (
        <div role="dialog" aria-modal="true" className="mobile-drawer">
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-header-user">
              {user ? `${user.firstName} ${user.lastName}` : ''}
            </span>
            <button
              type="button"
              className="mobile-drawer-close"
              onClick={onMobileClose}
              aria-label={t('nav.closeMenu')}
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="mobile-drawer-nav">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                onClick={onMobileClose}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="sidebar-link sidebar-logout"
            onClick={logout}
            data-testid="logout-button"
          >
            <span className="sidebar-icon">
              <LogoutIcon />
            </span>
            <span className="sidebar-label">{t('common.logout')}</span>
          </button>
        </div>
      )}
    </>
  );
}
