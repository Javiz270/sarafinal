/**
 * S.A.R.A. — Auth Context & Provider
 *
 * Manages authentication state across the application.
 * Handles session persistence, login/register flows,
 * Google OAuth, and logout.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '../../../lib/supabase';
import { api } from '../../../lib/api';
import type { Session } from '@supabase/supabase-js';

// ── Types ────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  career: string | null;
  group: string | null;
  role: 'user' | 'staff' | 'admin';
  created_at: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  career?: string;
  group?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const INSTITUTIONAL_DOMAIN = 'utr.edu.mx';

function isInstitutionalEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${INSTITUTIONAL_DOMAIN}`);
}

// ── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Fetch user profile from backend after authentication.
   */
  const fetchProfile = useCallback(async () => {
    try {
      const profile = await api.get<UserProfile>('/api/auth/me');
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  /**
   * Handle auth state changes from Supabase.
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
        fetchProfile().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession) {
        // For Google OAuth: ensure profile exists in backend
        const supaUser = newSession.user;
        if (supaUser?.app_metadata?.provider === 'google') {
          try {
            await api.post('/api/auth/google', {
              user_id: supaUser.id,
              email: supaUser.email,
              full_name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name,
              avatar_url: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture,
            });
          } catch {
            // Profile creation failed — will be handled by fetchProfile
          }
        }
        await fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Register a new user with institutional email.
   */
  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setLoading(true);

    try {
      if (!isInstitutionalEmail(data.email)) {
        throw new Error(`Solo se permiten correos institucionales @${INSTITUTIONAL_DOMAIN}`);
      }

      await api.post('/api/auth/register', data);
      // After registration, auto-login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (loginError) {
        throw new Error(loginError.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with email and password.
   */
  const login = useCallback(async (data: LoginData) => {
    setError(null);
    setLoading(true);

    try {
      if (!isInstitutionalEmail(data.email)) {
        throw new Error(`Solo se permiten correos institucionales @${INSTITUTIONAL_DOMAIN}`);
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (loginError) {
        throw new Error('Correo o contraseña incorrectos.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with Google OAuth.
   * Supabase handles the OAuth flow — domain validation happens server-side.
   */
  const loginWithGoogle = useCallback(async () => {
    setError(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            hd: INSTITUTIONAL_DOMAIN, // Restrict to institutional domain in Google consent screen
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        throw new Error(oauthError.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión con Google.';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Logout.
   */
  const logout = useCallback(async () => {
    setError(null);

    try {
      await supabase.auth.signOut();
      // Also notify backend
      try {
        await api.post('/api/auth/logout');
      } catch {
        // Backend logout is best-effort
      }
      setUser(null);
      setSession(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión.';
      setError(message);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
