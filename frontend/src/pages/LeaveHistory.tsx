import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { LeaveStatusBadge } from '../components/LeaveStatusBadge';
import { Modal } from '../components/Modal';
import { BanIcon } from '../components/layout/icons';
import { cancelLeaveRequest, fetchLeaveHistory } from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { LeaveRequest } from '../api/types';

export function LeaveHistory() {
  const { t } = useTranslation();
  const toast = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [search, setSearch] = useState('');

  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveHistory().then(setRequests);
  }, []);

  async function handleConfirmCancel() {
    if (!cancelTarget) {
      return;
    }
    setCancelError(null);
    setIsCancelling(true);
    try {
      const updated = await cancelLeaveRequest(cancelTarget.id);
      setRequests((prev) =>
        prev.map((request) => (request.id === updated.id ? updated : request)),
      );
      setCancelTarget(null);
      toast.success(t('manager.cancelLeaveSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t('manager.cancelLeaveError'));
      setCancelError(message);
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  }

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

      {cancelTarget && (
        <Modal
          title={t('manager.cancelLeaveTitle')}
          onClose={() => setCancelTarget(null)}
          closeLabel={t('common.close')}
        >
          <p className="modal-subtitle">
            {t(
              cancelTarget.type === 'ANNUAL'
                ? 'manager.cancelLeaveSubtitleAnnual'
                : 'manager.cancelLeaveSubtitleDaily',
              {
                name: cancelTarget.user
                  ? `${cancelTarget.user.firstName} ${cancelTarget.user.lastName}`
                  : '',
                count: cancelTarget.dayCount,
              },
            )}
          </p>
          {cancelError && <p className="form-error">{cancelError}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCancelTarget(null)}
              disabled={isCancelling}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              data-testid="cancel-leave-confirm"
            >
              {t('common.confirm')}
            </button>
          </div>
        </Modal>
      )}

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
                <th>{t('common.actions')}</th>
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
                  <td className="actions-cell">
                    {request.status === 'APPROVED' && (
                      <div className="actions-cell-inner">
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger icon-btn-plain"
                          onClick={() => setCancelTarget(request)}
                          aria-label={t('manager.cancelLeave')}
                          data-tooltip={t('manager.cancelLeave')}
                          data-testid={`cancel-leave-${request.id}`}
                        >
                          <BanIcon />
                        </button>
                      </div>
                    )}
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
