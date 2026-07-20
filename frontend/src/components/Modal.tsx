import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { CloseIcon } from './layout/icons';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel: string;
  size?: 'default' | 'large';
}

export function Modal({
  title,
  onClose,
  children,
  closeLabel,
  size = 'default',
}: ModalProps) {
  const mouseDownOnOverlay = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>) {
    mouseDownOnOverlay.current = event.target === event.currentTarget;
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (mouseDownOnOverlay.current && event.target === event.currentTarget) {
      onClose();
    }
    mouseDownOnOverlay.current = false;
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div
        className={size === 'large' ? 'modal modal--large' : 'modal'}
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
