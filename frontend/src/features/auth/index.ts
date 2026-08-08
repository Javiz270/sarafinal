// Auth feature — public exports
export { default as LoginPage } from './components/LoginPage';
export { default as RegisterPage } from './components/RegisterPage';
export { default as AuthCallback } from './components/AuthCallback';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as UnauthorizedPage } from './components/UnauthorizedPage';
export { AuthProvider, useAuth } from './hooks/useAuth';
export type { UserProfile } from './hooks/useAuth';
