import type { ReactNode } from 'react';
import type { UserRole } from '../../api/types';
import {
  CalendarIcon,
  ClipboardIcon,
  PlusIcon,
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
  { to: '/my-leaves', labelKey: 'nav.panel', icon: <CalendarIcon /> },
  { to: '/create-leave', labelKey: 'nav.createLeave', icon: <PlusIcon /> },
  {
    to: '/users',
    labelKey: 'nav.users',
    icon: <UsersIcon />,
    roles: ['MANAGER'],
  },
  { to: '/profile', labelKey: 'nav.profile', icon: <UserIcon /> },
];
