/**
 * Modal component — overlay dialog.
 * Skeleton — will be fully implemented in Phase 3.
 */

import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`modal modal--${size} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button className="modal__close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </header>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
