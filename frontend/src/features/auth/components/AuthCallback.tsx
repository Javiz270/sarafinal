/**
 * AuthCallback — handles the OAuth redirect callback.
 *
 * After Google OAuth, Supabase redirects back here.
 * This component waits for the auth state to settle,
 * then redirects to the appropriate page.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import './AuthPages.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          setError(authError.message);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session) {
          const email = data.session.user.email;
          // Validate institutional domain
          if (email && !email.toLowerCase().endsWith('@utr.edu.mx')) {
            await supabase.auth.signOut();
            setError('Solo se permiten correos institucionales @utr.edu.mx');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
          // Success — redirect to home (dashboard will be Phase 3)
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch {
        setError('Error al procesar la autenticación.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <section className="auth-page" id="auth-callback-page">
      <div className="auth-callback">
        {error ? (
          <div className="auth-callback__error animate-fade-in">
            <span className="auth-callback__icon">⚠️</span>
            <h2>Error de autenticación</h2>
            <p>{error}</p>
            <p className="auth-callback__redirect">Redirigiendo al login...</p>
          </div>
        ) : (
          <div className="auth-callback__loading animate-fade-in">
            <div className="auth-callback__spinner" />
            <h2>Verificando autenticación...</h2>
            <p>Espera un momento</p>
          </div>
        )}
      </div>
    </section>
  );
}
