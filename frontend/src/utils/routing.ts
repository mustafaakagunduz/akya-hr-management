import type { User } from '../api/types';

export function getDefaultRoute(user: Pick<User, 'role'>): string {
  return user.role === 'MANAGER' ? '/leave-requests' : '/my-leaves';
}
