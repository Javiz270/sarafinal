/**
 * UnauthorizedPage — displayed when a user lacks permissions for a route.
 */

import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <section className="container animate-fade-in" style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🚫</div>
      <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)' }}>Acceso Denegado</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        No tienes los permisos necesarios para ver esta página.
      </p>
      <Link to="/" className="navbar__btn navbar__btn--primary">
        Volver al inicio
      </Link>
    </section>
  );
}
