import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { SectionLoading } from '../components/SectionLoading';
import { CheckIcon, CloseIcon } from '../components/layout/icons';
import {
  approveLeaveRequest,
  fetchPendingLeaveRequests,
  rejectLeaveRequest,
} from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { formatDateTR } from '../utils/date';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import type { LeaveRequest } from '../api/types';

const DESCRIPTION_TRUNCATE_LENGTH = 60;

export function LeaveRequests() {
  const { t } = useTranslation();
  const socket = useSocket();
  const toast = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  function loadRequests() {
    setIsLoading(true);
    fetchPendingLeaveRequests()
      .then(setRequests)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleLeaveCreated(created: LeaveRequest) {
      setRequests((prev) => [created, ...prev]);
    }

    function handleLeaveEdited(edited: LeaveRequest) {
      setRequests((prev) =>
        prev.map((request) => (request.id === edited.id ? edited : request)),
      );
    }

    function handleLeaveDeleted({ id }: { id: string }) {
      setRequests((prev) => prev.filter((request) => request.id !== id));
    }

    socket.on('leave.created', handleLeaveCreated);
    socket.on('leave.edited', handleLeaveEdited);
    socket.on('leave.deleted', handleLeaveDeleted);
    return () => {
      socket.off('leave.created', handleLeaveCreated);
      socket.off('leave.edited', handleLeaveEdited);
      socket.off('leave.deleted', handleLeaveDeleted);
    };
  }, [socket]);

  const normalizedSearch = search.trim().toLocaleLowerCase('tr');
  const filteredRequests = normalizedSearch
    ? requests.filter((request) =>
        `${request.user?.firstName ?? ''} ${request.user?.lastName ?? ''}`
          .toLocaleLowerCase('tr')
          .includes(normalizedSearch),
      )
    : requests;

  async function handleApprove(id: string) {
    setError(null);
    setMessage(null);
    setProcessingId(id);
    try {
      await approveLeaveRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setMessage(t('manager.approveSuccess'));
      toast.success(t('manager.approveSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t, t('common.genericError'));
      setError(message);
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setError(null);
    setMessage(null);
    setProcessingId(id);
    try {
      await rejectLeaveRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setMessage(t('manager.rejectSuccess'));
      toast.success(t('manager.rejectSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t, t('common.genericError'));
      setError(message);
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AppLayout>
      <h1>{t('manager.title')}</h1>

      <input
        type="text"
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('manager.searchEmployee')}
        aria-label={t('manager.searchEmployee')}
        data-testid="pending-requests-search"
      />

      {error && <p className="form-error">{error}</p>}
      {message && (
        <p className="form-success" data-testid="manager-action-message">
          {message}
        </p>
      )}

      <div className="section">
        <h2>{t('manager.pendingRequests')}</h2>
        {isLoading ? (
          <SectionLoading />
        ) : filteredRequests.length === 0 ? (
          <p className="muted">
            {requests.length === 0
              ? t('manager.noPending')
              : t('manager.noSearchResults')}
          </p>
        ) : (
          <table className="table-responsive" data-testid="pending-requests-table">
            <thead>
              <tr>
                <th>{t('manager.employee')}</th>
                <th>{t('manager.department')}</th>
                <th>{t('leaves.type.label')}</th>
                <th>{t('leaves.startDate')}</th>
                <th>{t('leaves.endDate')}</th>
                <th>{t('leaves.dayCount')}</th>
                <th>{t('leaves.description')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => {
                const description = request.description ?? '';
                const isLong =
                  description.length > DESCRIPTION_TRUNCATE_LENGTH;
                const isExpanded = expandedDescriptions.has(request.id);

                return (
                <tr key={request.id} data-testid="pending-row">
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
                  <td data-label={t('leaves.type.label')}>
                    {t(`leaves.type.${request.type}`)}
                  </td>
                  <td data-label={t('leaves.startDate')}>
                    {formatDateTR(request.startDate)}
                  </td>
                  <td data-label={t('leaves.endDate')}>
                    {formatDateTR(request.endDate)}
                  </td>
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
                            data-testid={`pending-description-toggle-${request.id}`}
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
                  <td className="actions-cell" data-label={t('common.actions')}>
                    <div className="actions-cell-inner accent-actions-inner">
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain accent-icon-btn leave-action-icon-btn approve-icon-btn"
                        disabled={processingId === request.id}
                        onClick={() => handleApprove(request.id)}
                        aria-label={t('common.approve')}
                        data-tooltip={t('common.approve')}
                        data-testid={`approve-${request.id}`}
                      >
                        <CheckIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-plain accent-icon-btn leave-action-icon-btn reject-icon-btn"
                        disabled={processingId === request.id}
                        onClick={() => handleReject(request.id)}
                        aria-label={t('common.reject')}
                        data-tooltip={t('common.reject')}
                        data-testid={`reject-${request.id}`}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  </td>
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
