import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Topbar } from '../components/Topbar';
import {
  approveLeaveRequest,
  fetchPendingLeaveRequests,
  rejectLeaveRequest,
} from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { useSocket } from '../context/SocketContext';
import type { LeaveRequest } from '../api/types';

const DESCRIPTION_TRUNCATE_LENGTH = 60;

function DescriptionCell({ text }: { text: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (text.length <= DESCRIPTION_TRUNCATE_LENGTH) {
    return <>{text}</>;
  }

  return (
    <div className="description-cell">
      <span>
        {expanded ? text : `${text.slice(0, DESCRIPTION_TRUNCATE_LENGTH)}...`}
      </span>
      <button
        type="button"
        className="description-toggle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={expanded ? t('common.showLess') : t('common.showMore')}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={expanded ? 'chevron chevron-up' : 'chevron'}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}

export function ManagerPanel() {
  const { t } = useTranslation();
  const socket = useSocket();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  function loadRequests() {
    fetchPendingLeaveRequests().then(setRequests);
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

    socket.on('leave.created', handleLeaveCreated);
    return () => {
      socket.off('leave.created', handleLeaveCreated);
    };
  }, [socket]);

  async function handleApprove(id: string) {
    setError(null);
    setMessage(null);
    setProcessingId(id);
    try {
      await approveLeaveRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setMessage(t('manager.approveSuccess'));
    } catch (err) {
      setError(getApiErrorMessage(err, t('common.genericError')));
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
    } catch (err) {
      setError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="page">
      <Topbar />
      <h1>{t('manager.title')}</h1>
      {error && <p className="form-error">{error}</p>}
      {message && (
        <p className="form-success" data-testid="manager-action-message">
          {message}
        </p>
      )}

      <div className="section">
        <h2>{t('manager.pendingRequests')}</h2>
        {requests.length === 0 ? (
          <p className="muted">{t('manager.noPending')}</p>
        ) : (
          <table data-testid="pending-requests-table">
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
              {requests.map((request) => (
                <tr key={request.id} data-testid="pending-row">
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
                  <td>
                    {request.description ? (
                      <DescriptionCell text={request.description} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="actions-cell-inner">
                      <button
                        type="button"
                        className="btn btn-sm"
                        disabled={processingId === request.id}
                        onClick={() => handleApprove(request.id)}
                        data-testid={`approve-${request.id}`}
                      >
                        {t('common.approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={processingId === request.id}
                        onClick={() => handleReject(request.id)}
                        data-testid={`reject-${request.id}`}
                      >
                        {t('common.reject')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
