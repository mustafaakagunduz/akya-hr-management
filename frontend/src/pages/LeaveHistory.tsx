import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { LeaveStatusBadge } from '../components/LeaveStatusBadge';
import { Modal } from '../components/Modal';
import { CloseIcon } from '../components/layout/icons';
import { cancelLeaveRequest, fetchLeaveHistory } from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { LeaveRequest } from '../api/types';

const DESCRIPTION_TRUNCATE_LENGTH = 60;

export function LeaveHistory() {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const viewingAll = isManager && !showOnlyMine;
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [search, setSearch] = useState('');

  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Set<string>
  >(new Set());

  function toggleDescription(id: string) {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  useEffect(() => {
    fetchLeaveHistory(viewingAll ? 'all' : undefined).then(setRequests);
  }, [viewingAll]);

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
      const message = getApiErrorMessage(err, t, t('manager.cancelLeaveError'));
      setCancelError(message);
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  }

  const normalizedSearch = search.trim().toLocaleLowerCase('tr');
  const filteredRequests = viewingAll && normalizedSearch
    ? requests.filter((request) =>
        `${request.user?.firstName ?? ''} ${request.user?.lastName ?? ''}`
          .toLocaleLowerCase('tr')
          .includes(normalizedSearch),
      )
    : requests;

  const todayIso = new Date().toISOString().slice(0, 10);
  function isOnLeave(request: LeaveRequest) {
    return (
      viewingAll &&
      request.status === 'APPROVED' &&
      request.startDate <= todayIso &&
      request.endDate >= todayIso
    );
  }

  return (
    <AppLayout>
      <div className="page-title-row">
        <h1>{t('nav.leaveHistory')}</h1>
        {isManager && (
          <label className="switch-row">
            <span className="switch-label">{t('manager.onlyMineToggle')}</span>
            <span className="switch">
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
                data-testid="only-mine-toggle"
              />
              <span className="switch-track" />
            </span>
          </label>
        )}
      </div>

      {viewingAll && (
        <>
          <input
            type="text"
            className="search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('manager.searchEmployee')}
            aria-label={t('manager.searchEmployee')}
            data-testid="leave-history-search"
          />
          <p className="on-leave-info" data-testid="on-leave-info">
            {t('manager.onLeaveInfo')}
          </p>
        </>
      )}

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
              },
            )}
          </p>
          {cancelTarget.type === 'ANNUAL' && (
            <p className="modal-info">
              {t('manager.cancelLeaveDaysInfo', {
                count: cancelTarget.dayCount,
              })}
            </p>
          )}
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
          <table className="table-responsive" data-testid="leave-history-table">
            <thead>
              <tr>
                {viewingAll && (
                  <>
                    <th>{t('manager.employee')}</th>
                    <th>{t('manager.department')}</th>
                  </>
                )}
                <th>{t('leaves.type.label')}</th>
                <th>{t('leaves.startDate')}</th>
                <th>{t('leaves.endDate')}</th>
                <th>{t('leaves.dayCount')}</th>
                <th>{t('leaves.description')}</th>
                <th>{t('leaves.status.label')}</th>
                {isManager && <th>{t('common.actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => {
                const description = request.description ?? '';
                const isLong =
                  description.length > DESCRIPTION_TRUNCATE_LENGTH;
                const isExpanded = expandedDescriptions.has(request.id);

                return (
                <tr
                  key={request.id}
                  data-testid="leave-history-row"
                  className={isOnLeave(request) ? 'row-on-leave' : undefined}
                >
                  {viewingAll && (
                    <>
                      <td data-label={t('manager.employee')}>
                        {request.user
                          ? `${request.user.firstName} ${request.user.lastName}`
                          : '-'}
                      </td>
                      <td data-label={t('manager.department')}>
                        {request.user
                          ? t(`options.department.${request.user.department}`)
                          : '-'}
                      </td>
                    </>
                  )}
                  <td data-label={t('leaves.type.label')}>
                    {t(`leaves.type.${request.type}`)}
                  </td>
                  <td data-label={t('leaves.startDate')}>
                    {request.startDate}
                  </td>
                  <td data-label={t('leaves.endDate')}>{request.endDate}</td>
                  <td data-label={t('leaves.dayCount')}>
                    {request.dayCount}
                  </td>
                  <td className="description-cell" data-label={t('leaves.description')}>
                    {description ? (
                      <>
                        <span className="description-text-full">
                          {description}
                        </span>
                        <span className="description-text-mobile">
                          {isExpanded || !isLong
                            ? description
                            : `${description.slice(0, DESCRIPTION_TRUNCATE_LENGTH).trimEnd()}...`}
                        </span>
                        {isLong && (
                          <button
                            type="button"
                            className="description-toggle"
                            onClick={() => toggleDescription(request.id)}
                            data-testid={`leave-history-description-toggle-${request.id}`}
                          >
                            {isExpanded
                              ? t('leaves.showLess')
                              : t('leaves.showMore')}
                          </button>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="status-cell" data-label={t('leaves.status.label')}>
                    <LeaveStatusBadge status={request.status} />
                  </td>
                  {isManager && (
                    <td className="actions-cell" data-label={t('common.actions')}>
                      {request.status === 'APPROVED' ? (
                        <div className="actions-cell-inner accent-actions-inner">
                          <button
                            type="button"
                            className="icon-btn icon-btn-plain accent-icon-btn reject-icon-btn"
                            onClick={() => setCancelTarget(request)}
                            aria-label={t('manager.cancelLeaveButton')}
                            data-tooltip={t('manager.cancelLeaveButton')}
                            data-testid={`cancel-leave-${request.id}`}
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
