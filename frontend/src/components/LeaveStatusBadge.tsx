import { useTranslation } from 'react-i18next';
import type { LeaveStatus } from '../api/types';

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`badge badge-${status}`} data-testid={`status-badge-${status}`}>
      {t(`leaves.status.${status}`)}
    </span>
  );
}
