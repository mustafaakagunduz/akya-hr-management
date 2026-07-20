import type { ReactNode } from 'react';
import { CloseIcon } from './layout/icons';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel: string;
}

export function Modal({ title, onClose, children, closeLabel }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
