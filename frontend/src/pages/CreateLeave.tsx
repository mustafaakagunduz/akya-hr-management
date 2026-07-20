import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { LeaveRequestFields } from '../components/LeaveRequestFields';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createLeaveRequest } from '../api/leaves';
import { getApiErrorMessage } from '../api/client';
import { formatDateTR } from '../utils/date';
import type { LeaveType } from '../api/types';

export function CreateLeave() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();

  const [type, setType] = useState<LeaveType>('DAILY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (new Date(endDate) < new Date(startDate)) {
      setError(t('validation.endBeforeStart'));
      return;
    }

    setIsConfirmOpen(true);
  }

  async function handleConfirmedSubmit() {
    setIsSubmitting(true);
    try {
      await createLeaveRequest({
        type,
        startDate,
        endDate,
        description: description || undefined,
      });
      setSuccess(true);
      toast.success(t('leaves.createSuccess'));
      setIsConfirmOpen(false);
      setStartDate('');
      setEndDate('');
      setDescription('');
      setFormKey((k) => k + 1);
    } catch (err) {
      setIsConfirmOpen(false);
      const message = getApiErrorMessage(err, t, t('common.genericError'));
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <h1>{t('panel.newRequest')}</h1>
      <p className="balance" data-testid="annual-balance">
        {t('leaves.annualBalance', { count: user?.annualLeaveBalance ?? 0 })}
      </p>

      <div className="section card">
        {error && <p className="form-error">{error}</p>}
        {success && (
          <p className="form-success" data-testid="leave-create-success">
            {t('leaves.createSuccess')}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <LeaveRequestFields
            key={formKey}
            idPrefix="leave"
            testIdPrefix="leave"
            type={type}
            onTypeChange={setType}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            description={description}
            onDescriptionChange={setDescription}
          />
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

      {isConfirmOpen && (
        <Modal
          title={t('leaves.confirmTitle')}
          onClose={() => setIsConfirmOpen(false)}
          closeLabel={t('common.close')}
        >
          <p className="modal-subtitle">{t('leaves.confirmSubtitle')}</p>
          <div className="modal-row">
            <span className="modal-row-label">{t('leaves.type.label')}</span>
            <span className="modal-row-value">{t(`leaves.type.${type}`)}</span>
          </div>
          {type === 'DAILY' ? (
            <div className="modal-row">
              <span className="modal-row-label">{t('leaves.date')}</span>
              <span className="modal-row-value">
                {formatDateTR(startDate)}
              </span>
            </div>
          ) : (
            <>
              <div className="modal-row">
                <span className="modal-row-label">
                  {t('leaves.startDate')}
                </span>
                <span className="modal-row-value">
                  {formatDateTR(startDate)}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-row-label">{t('leaves.endDate')}</span>
                <span className="modal-row-value">
                  {formatDateTR(endDate)}
                </span>
              </div>
            </>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
              data-testid="leave-confirm-submit"
            >
              {t('common.confirm')}
            </button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
