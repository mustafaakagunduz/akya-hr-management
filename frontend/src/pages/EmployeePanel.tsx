import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { LeaveStatusBadge } from '../components/LeaveStatusBadge';
import { LeaveRequestFields } from '../components/LeaveRequestFields';
import { Modal } from '../components/Modal';
import { PencilIcon, TrashIcon } from '../components/layout/icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  deleteLeaveRequest,
  fetchMyLeaveRequests,
  updateLeaveRequest,
} from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { formatDateTR } from '../utils/date';
import type { LeaveRequest, LeaveType } from '../api/types';

export function EmployeePanel() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const socket = useSocket();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [editType, setEditType] = useState<LeaveType>('DAILY');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const [deletingRequest, setDeletingRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  function openEdit(request: LeaveRequest) {
    setEditingRequest(request);
    setEditType(request.type);
    setEditStartDate(request.startDate);
    setEditEndDate(request.endDate);
    setEditDescription(request.description ?? '');
    setEditError(null);
  }

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault();
    if (!editingRequest) {
      return;
    }
    setEditError(null);

    if (new Date(editEndDate) < new Date(editStartDate)) {
      setEditError(t('validation.endBeforeStart'));
      return;
    }

    setIsEditSubmitting(true);
    try {
      const updated = await updateLeaveRequest(editingRequest.id, {
        type: editType,
        startDate: editStartDate,
        endDate: editEndDate,
        description: editDescription || undefined,
      });
      setRequests((prev) =>
        prev.map((request) =>
          request.id === updated.id ? updated : request,
        ),
      );
      setEditingRequest(null);
    } catch (err) {
      setEditError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setIsEditSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingRequest) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteLeaveRequest(deletingRequest.id);
      setRequests((prev) =>
        prev.filter((request) => request.id !== deletingRequest.id),
      );
      setDeletingRequest(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AppLayout>
      <h1>{t('leaves.myRequests')}</h1>
      <p className="balance" data-testid="annual-balance">
        {t('leaves.annualBalance', { count: user?.annualLeaveBalance ?? 0 })}
      </p>

      {editingRequest && (
        <Modal
          title={t('leaves.editTitle')}
          onClose={() => setEditingRequest(null)}
          closeLabel={t('common.close')}
        >
          <form onSubmit={handleEditSubmit}>
            {editError && <p className="form-error">{editError}</p>}
            <LeaveRequestFields
              idPrefix="leave-edit"
              testIdPrefix="leave-edit"
              type={editType}
              onTypeChange={setEditType}
              startDate={editStartDate}
              onStartDateChange={setEditStartDate}
              endDate={editEndDate}
              onEndDateChange={setEditEndDate}
              description={editDescription}
              onDescriptionChange={setEditDescription}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingRequest(null)}
                disabled={isEditSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn"
                disabled={isEditSubmitting}
                data-testid="leave-edit-submit"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingRequest && (
        <Modal
          title={t('leaves.deleteTitle')}
          onClose={() => setDeletingRequest(null)}
          closeLabel={t('common.close')}
        >
          <p className="modal-subtitle">{t('leaves.deleteSubtitle')}</p>
          {deleteError && <p className="form-error">{deleteError}</p>}
          <div className="modal-row">
            <span className="modal-row-label">{t('leaves.type.label')}</span>
            <span className="modal-row-value">
              {t(`leaves.type.${deletingRequest.type}`)}
            </span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">{t('leaves.startDate')}</span>
            <span className="modal-row-value">
              {formatDateTR(deletingRequest.startDate)}
            </span>
          </div>
          <div className="modal-row">
            <span className="modal-row-label">{t('leaves.endDate')}</span>
            <span className="modal-row-value">
              {formatDateTR(deletingRequest.endDate)}
            </span>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeletingRequest(null)}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              data-testid="leave-delete-confirm"
            >
              {t('common.delete')}
            </button>
          </div>
        </Modal>
      )}

      <div className="section">
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
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
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
                    {request.status === 'PENDING' ? (
                      <div className="actions-cell-inner">
                        <button
                          type="button"
                          className="icon-btn icon-btn-plain"
                          onClick={() => openEdit(request)}
                          aria-label={t('common.edit')}
                          data-tooltip={t('common.edit')}
                          data-testid={`leave-edit-${request.id}`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger icon-btn-plain"
                          onClick={() => setDeletingRequest(request)}
                          aria-label={t('common.delete')}
                          data-tooltip={t('common.delete')}
                          data-testid={`leave-delete-${request.id}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ) : (
                      <span className="muted">-</span>
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
