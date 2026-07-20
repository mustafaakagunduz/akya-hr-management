import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';

export function ToastContainer() {
  const { t } = useTranslation();
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="status"
          data-testid={`toast-${toast.type}`}
        >
          <span className="toast-icon" aria-hidden="true">
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
