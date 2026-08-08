/**
 * ErrorState component — displayed when an error occurs.
 */

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Algo salió mal',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button className="error-state__retry" onClick={onRetry}>
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
