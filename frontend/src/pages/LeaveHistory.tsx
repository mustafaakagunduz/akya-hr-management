import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { LeaveStatusBadge } from '../components/LeaveStatusBadge';
import { fetchLeaveHistory } from '../api/leaves';
import type { LeaveRequest } from '../api/types';

export function LeaveHistory() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeaveHistory().then(setRequests);
  }, []);

  const normalizedSearch = search.trim().toLocaleLowerCase('tr');
  const filteredRequests = normalizedSearch
    ? requests.filter((request) =>
        `${request.user?.firstName ?? ''} ${request.user?.lastName ?? ''}`
          .toLocaleLowerCase('tr')
          .includes(normalizedSearch),
      )
    : requests;

  return (
    <AppLayout>
      <h1>{t('nav.leaveHistory')}</h1>

      <input
        type="text"
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('manager.searchEmployee')}
        aria-label={t('manager.searchEmployee')}
        data-testid="leave-history-search"
      />

      <div className="section">
        {filteredRequests.length === 0 ? (
          <p className="muted">
            {requests.length === 0
              ? t('manager.noHistory')
              : t('manager.noSearchResults')}
          </p>
        ) : (
          <table data-testid="leave-history-table">
            <thead>
              <tr>
                <th>{t('manager.employee')}</th>
                <th>{t('manager.department')}</th>
                <th>{t('leaves.type.label')}</th>
                <th>{t('leaves.startDate')}</th>
                <th>{t('leaves.endDate')}</th>
                <th>{t('leaves.dayCount')}</th>
                <th>{t('leaves.description')}</th>
                <th>{t('leaves.status.label')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} data-testid="leave-history-row">
                  <td>
                    {request.user
                      ? `${request.user.firstName} ${request.user.lastName}`
                      : '-'}
                  </td>
                  <td>
                    {request.user
                      ? t(`options.department.${request.user.department}`)
                      : '-'}
                  </td>
                  <td>{t(`leaves.type.${request.type}`)}</td>
                  <td>{request.startDate}</td>
                  <td>{request.endDate}</td>
                  <td>{request.dayCount}</td>
                  <td className="description-cell">
                    {request.description || '-'}
                  </td>
                  <td>
                    <LeaveStatusBadge status={request.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
