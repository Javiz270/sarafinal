/**
 * Toast component — notification messages.
 * Skeleton — will be fully implemented in Phase 3.
 */

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  return (
    <div className={`toast toast--${type}`} role="alert" aria-live="polite">
      <p className="toast__message">{message}</p>
      {onClose && (
        <button className="toast__close" onClick={onClose} aria-label="Cerrar notificación">
          ✕
        </button>
      )}
    </div>
  );
}
