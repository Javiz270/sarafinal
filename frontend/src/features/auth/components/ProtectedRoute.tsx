/**
 * ProtectedRoute — component for role-based access control.
 *
 * Wraps routes that require authentication and specific roles.
 * - If not authenticated: redirects to /login.
 * - If authenticated but lacks role: redirects to an unauthorized/fallback route.
 * - If still loading: shows a loading spinner.
 */

import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type UserProfile } from '../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: UserProfile['role'][];
  redirectTo?: string;
  children?: ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
  children
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    // Save the intended location to redirect back after login (to be implemented in LoginPage if desired)
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Authenticated but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are logged in but don't have access, send them to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized
  return children ? <>{children}</> : <Outlet />;
}
