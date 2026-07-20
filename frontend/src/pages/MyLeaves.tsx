import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { LeaveStatusBadge } from '../components/LeaveStatusBadge';
import { LeaveRequestFields } from '../components/LeaveRequestFields';
import { Modal } from '../components/Modal';
import { PencilIcon, TrashIcon } from '../components/layout/icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import {
  deleteLeaveRequest,
  fetchMyLeaveRequests,
  updateLeaveRequest,
} from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { formatDateTR } from '../utils/date';
import type { LeaveRequest, LeaveType } from '../api/types';

const DESCRIPTION_TRUNCATE_LENGTH = 60;

export function MyLeaves() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const socket = useSocket();
  const toast = useToast();

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

  const pendingRequests = requests.filter(
    (request) => request.status === 'PENDING',
  );

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
      toast.success(t('leaves.editSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t, t('common.genericError'));
      setEditError(message);
      toast.error(message);
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
      toast.success(t('leaves.deleteSuccess'));
    } catch (err) {
      const message = getApiErrorMessage(err, t, t('common.genericError'));
      setDeleteError(message);
      toast.error(message);
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
              key={editingRequest.id}
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
        {pendingRequests.length === 0 ? (
          <p className="muted">{t('leaves.noRequests')}</p>
        ) : (
          <table className="table-responsive" data-testid="my-requests-table">
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
              {pendingRequests.map((request) => {
                const description = request.description ?? '';
                const isLong =
                  description.length > DESCRIPTION_TRUNCATE_LENGTH;
                const isExpanded = expandedDescriptions.has(request.id);

                return (
                <tr key={request.id}>
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
                  <td
                    className="description-cell"
                    data-label={t('leaves.description')}
                  >
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
                            data-testid={`leave-description-toggle-${request.id}`}
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
                  <td
                    className="status-cell"
                    data-label={t('leaves.status.label')}
                  >
                    <LeaveStatusBadge status={request.status} />
                  </td>
                  <td className="actions-cell" data-label={t('common.actions')}>
                    {request.status === 'PENDING' ? (
                      <div className="actions-cell-inner accent-actions-inner">
                        <button
                          type="button"
                          className="icon-btn icon-btn-plain accent-icon-btn"
                          onClick={() => openEdit(request)}
                          aria-label={t('common.edit')}
                          data-tooltip={t('common.edit')}
                          data-testid={`leave-edit-${request.id}`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-plain accent-icon-btn reject-icon-btn"
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
