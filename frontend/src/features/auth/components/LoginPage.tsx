/**
 * LoginPage — institutional login with email/password + Google OAuth.
 *
 * Enforces @utr.edu.mx domain validation on the client side.
 * Premium dark-mode design with glassmorphism and animations.
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function LoginPage() {
  const { login, loginWithGoogle, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Todos los campos son obligatorios.');
      return;
    }

    if (!email.toLowerCase().endsWith('@utr.edu.mx')) {
      setLocalError('Solo se permiten correos institucionales @utr.edu.mx');
      return;
    }

    try {
      await login({ email, password });
      navigate('/');
    } catch {
      // Error is handled by useAuth
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLocalError('');
    try {
      await loginWithGoogle();
    } catch {
      // Error is handled by useAuth
    }
  };

  const displayError = localError || error;

  return (
    <section className="auth-page animate-fade-in" id="login-page">
      <div className="auth-page__container">
        {/* Left: decorative panel */}
        <div className="auth-page__hero">
          <div className="auth-page__hero-content">
            <div className="auth-page__logo-mark">
              <span className="auth-page__logo-icon">📚</span>
            </div>
            <h1 className="auth-page__hero-title">S.A.R.A.</h1>
            <p className="auth-page__hero-subtitle">
              Sistema de Administración y Registro Académico
            </p>
            <div className="auth-page__hero-features">
              <div className="auth-page__feature">
                <span className="auth-page__feature-icon">🏛️</span>
                <span>Learning Commons</span>
              </div>
              <div className="auth-page__feature">
                <span className="auth-page__feature-icon">📖</span>
                <span>Gestión de préstamos</span>
              </div>
              <div className="auth-page__feature">
                <span className="auth-page__feature-icon">📊</span>
                <span>Reportes y estadísticas</span>
              </div>
            </div>
          </div>
          <div className="auth-page__hero-gradient" />
        </div>

        {/* Right: login form */}
        <div className="auth-page__form-section">
          <div className="auth-page__form-wrapper">
            <div className="auth-page__form-header">
              <h2 className="auth-page__title">Iniciar Sesión</h2>
              <p className="auth-page__subtitle">
                Ingresa con tu cuenta institucional
              </p>
            </div>

            {displayError && (
              <div className="auth-page__alert auth-page__alert--error animate-fade-in-down" role="alert" id="login-error">
                <span className="auth-page__alert-icon">⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-page__form" id="login-form">
              <div className="auth-page__field">
                <label htmlFor="login-email" className="auth-page__label">
                  Correo institucional
                </label>
                <div className="auth-page__input-wrapper">
                  <span className="auth-page__input-icon">✉️</span>
                  <input
                    id="login-email"
                    type="email"
                    className="auth-page__input"
                    placeholder="tu.nombre@utr.edu.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <span className="auth-page__hint">Solo correos @utr.edu.mx</span>
              </div>

              <div className="auth-page__field">
                <label htmlFor="login-password" className="auth-page__label">
                  Contraseña
                </label>
                <div className="auth-page__input-wrapper">
                  <span className="auth-page__input-icon">🔒</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-page__input"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-page__toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    id="toggle-password"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-page__submit-btn"
                disabled={loading}
                id="login-submit"
              >
                {loading ? (
                  <span className="auth-page__spinner" />
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="auth-page__divider">
              <span>o</span>
            </div>

            <button
              type="button"
              className="auth-page__google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              id="google-login"
            >
              <svg className="auth-page__google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>

            <p className="auth-page__footer-text">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="auth-page__link" id="go-to-register">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
