/**
 * LoadingScreen component — full-screen loading indicator.
 */

export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Cargando">
      <div className="loading-screen__spinner animate-spin" />
      <p className="loading-screen__text">Cargando...</p>
    </div>
  );
}
