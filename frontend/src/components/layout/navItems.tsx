import type { ReactNode } from 'react';
import type { UserRole } from '../../api/types';
import {
  CalendarIcon,
  ClipboardIcon,
  HistoryIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from './icons';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: ReactNode;
  roles?: UserRole[];
}

export const navItems: NavItem[] = [
  {
    to: '/leave-requests',
    labelKey: 'nav.manager',
    icon: <ClipboardIcon />,
    roles: ['MANAGER'],
  },
  {
    to: '/leave-history',
    labelKey: 'nav.leaveHistory',
    icon: <HistoryIcon />,
    roles: ['MANAGER'],
  },
  { to: '/my-leaves', labelKey: 'nav.panel', icon: <CalendarIcon /> },
  { to: '/create-leave', labelKey: 'nav.createLeave', icon: <PlusIcon /> },
  {
    to: '/users',
    labelKey: 'nav.users',
    icon: <UsersIcon />,
    roles: ['MANAGER'],
  },
  { to: '/profile', labelKey: 'nav.profile', icon: <UserIcon /> },
  { to: '/settings', labelKey: 'nav.settings', icon: <SettingsIcon /> },
];
