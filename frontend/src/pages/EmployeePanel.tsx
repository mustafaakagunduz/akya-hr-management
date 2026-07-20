import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Topbar } from '../components/Topbar';
import { LeaveStatusBadge } from '../components/LeaveStatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { createLeaveRequest, fetchMyLeaveRequests } from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import type { LeaveRequest, LeaveType } from '../api/types';

export function EmployeePanel() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const socket = useSocket();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [type, setType] = useState<LeaveType>('DAILY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadRequests() {
    fetchMyLeaveRequests().then(setRequests);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleLeaveUpdated(updated: LeaveRequest) {
      setRequests((prev) =>
        prev.map((request) =>
          request.id === updated.id ? updated : request,
        ),
      );
      if (updated.status === 'APPROVED' && updated.type === 'ANNUAL') {
        refreshUser();
      }
    }

    socket.on('leave.updated', handleLeaveUpdated);
    return () => {
      socket.off('leave.updated', handleLeaveUpdated);
    };
  }, [socket, refreshUser]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (new Date(endDate) < new Date(startDate)) {
      setError(t('validation.endBeforeStart'));
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createLeaveRequest({
        type,
        startDate,
        endDate,
        description: description || undefined,
      });
      setRequests((prev) => [created, ...prev]);
      setSuccess(true);
      setStartDate('');
      setEndDate('');
      setDescription('');
    } catch (err) {
      setError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Topbar />
      <h1>{t('panel.title')}</h1>
      <p className="balance" data-testid="annual-balance">
        {t('leaves.annualBalance', { count: user?.annualLeaveBalance ?? 0 })}
      </p>

      <div className="section card">
        <h2>{t('panel.newRequest')}</h2>
        {error && <p className="form-error">{error}</p>}
        {success && (
          <p className="form-success" data-testid="leave-create-success">
            {t('leaves.createSuccess')}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="type">{t('leaves.type.label')}</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              data-testid="leave-type"
            >
              <option value="DAILY">{t('leaves.type.DAILY')}</option>
              <option value="ANNUAL">{t('leaves.type.ANNUAL')}</option>
            </select>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="startDate">{t('leaves.startDate')}</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                data-testid="leave-start-date"
              />
            </div>
            <div className="field">
              <label htmlFor="endDate">{t('leaves.endDate')}</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                data-testid="leave-end-date"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="description">{t('leaves.description')}</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-testid="leave-description"
            />
          </div>
          <button
            type="submit"
            className="btn"
            disabled={isSubmitting}
            data-testid="leave-submit"
          >
            {t('leaves.submit')}
          </button>
        </form>
      </div>

      <div className="section">
        <h2>{t('leaves.myRequests')}</h2>
        {requests.length === 0 ? (
          <p className="muted">{t('leaves.noRequests')}</p>
        ) : (
          <table data-testid="my-requests-table">
            <thead>
              <tr>
                <th>{t('leaves.type.label')}</th>
                <th>{t('leaves.startDate')}</th>
                <th>{t('leaves.endDate')}</th>
                <th>{t('leaves.dayCount')}</th>
                <th>{t('leaves.description')}</th>
                <th>{t('leaves.status.label')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{t(`leaves.type.${request.type}`)}</td>
                  <td>{request.startDate}</td>
                  <td>{request.endDate}</td>
                  <td>{request.dayCount}</td>
                  <td>{request.description || '-'}</td>
                  <td>
                    <LeaveStatusBadge status={request.status} />
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
