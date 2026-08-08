/**
 * Footer component — site footer.
 * Skeleton — will be fully implemented in Phase 3.
 */

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <p className="footer__text">
          © {new Date().getFullYear()} S.A.R.A. — Sistema de Administración y Registro Académico
        </p>
      </div>
    </footer>
  );
}
