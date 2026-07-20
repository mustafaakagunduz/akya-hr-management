import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import {
  approveLeaveRequest,
  fetchPendingLeaveRequests,
  rejectLeaveRequest,
} from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import type { LeaveRequest } from '../api/types';

export function ManagerPanel() {
  const { t } = useTranslation();
  const socket = useSocket();
  const toast = useToast();
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
      const message = getApiErrorMessage(err, t('common.genericError'));
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
      const message = getApiErrorMessage(err, t('common.genericError'));
      setError(message);
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AppLayout>
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
                  <td className="description-cell">
                    {request.description || '-'}
                  </td>
                  <td className="actions-cell">
                    <div className="actions-cell-inner">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
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
    </AppLayout>
  );
}
