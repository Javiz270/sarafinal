/**
 * Navbar component — top navigation bar with auth state awareness.
 *
 * Shows login/register buttons when unauthenticated,
 * and user info with logout when authenticated.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth';

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="navbar">
      <nav className="navbar__inner container" aria-label="Navegación principal">
        <Link to="/" className="navbar__logo" aria-label="S.A.R.A. — Inicio">
          S.A.R.A.
        </Link>
        <div className="navbar__actions">
          {loading ? null : user ? (
            <>
              <span className="navbar__user-info">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="navbar__avatar"
                    width="28"
                    height="28"
                  />
                )}
                <span className="navbar__user-name">
                  {user.full_name || user.email}
                </span>
                <span className="navbar__user-role" data-role={user.role}>
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="navbar__btn navbar__btn--outline"
                id="logout-btn"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--outline" id="nav-login">
                Iniciar sesión
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary" id="nav-register">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
