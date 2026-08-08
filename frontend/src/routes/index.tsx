/**
 * S.A.R.A. — Route Configuration
 *
 * Defines all application routes organized by role.
 * Phase 3: Added protected routes, layouts, and feature placeholders.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import UserLayout from '../layouts/UserLayout';
import StaffLayout from '../layouts/StaffLayout';
import AdminLayout from '../layouts/AdminLayout';
import { LoginPage, RegisterPage, AuthCallback, UnauthorizedPage } from '../features/auth';
import { DashboardPage } from '../features/dashboard';
import { CubiclesUserPage, CubiclesStaffPage } from '../features/cubicles';
import { BooksUserPage, BooksStaffPage } from '../features/books';
import { GenerateLoanPage, LoanListPage, UserLoanListPage } from '../features/loans';
import { VisitorListPage } from '../features/visitors';
import { UserEventListPage, StaffEventListPage, EventDetailPage } from '../features/events';
import { StaffStatisticsPage } from '../features/statistics';
import { ReportsPage } from '../features/reports/components/ReportsPage';
import { useAuth } from '../features/auth';

// ── Placeholder Pages (Phases 4-10) ─────────────────────────

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-fade-in" style={{ padding: 'var(--space-4)' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </div>
  );
}

// ── Dynamic Landing / Dashboard Redirect ────────────────────

/**
 * Redirects the user based on authentication status.
 * Logged in users go to the Dashboard, logged out users see the Landing Page.
 */
function RootRoute() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <section className="container animate-fade-in" style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>Bienvenido a S.A.R.A.</h1>
      <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>
        Sistema de Administración y Registro Académico
      </p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="container" style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--font-size-4xl)' }}>404</h1>
      <p>Página no encontrada</p>
    </section>
  );
}

// ── Router Configuration ─────────────────────────────────────

export const router = createBrowserRouter([
  // ── Public & Root Routes ───────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <RootRoute /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/auth/callback', element: <AuthCallback /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },
    ],
  },

  // ── Protected User Routes ──────────────────────────────────
  {
    element: <UserLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/cubicles', element: <CubiclesUserPage /> },
      { path: '/books', element: <BooksUserPage /> },
      { path: '/loans/my-loans', element: <UserLoanListPage /> },
      { path: '/events/upcoming', element: <UserEventListPage /> },
    ],
  },

  // ── Protected Staff Routes ─────────────────────────────────
  {
    element: <StaffLayout />,
    children: [
      { path: '/staff/cubicles', element: <CubiclesStaffPage /> },
      { path: '/staff/loans', element: <LoanListPage /> },
      { path: '/staff/loans/generate', element: <GenerateLoanPage /> },
      { path: '/staff/books', element: <BooksStaffPage /> },
      { path: '/staff/visitors', element: <VisitorListPage /> },
      { path: '/staff/events', element: <StaffEventListPage /> },
      { path: '/staff/events/:id', element: <EventDetailPage /> },
      { path: '/staff/statistics', element: <StaffStatisticsPage /> },
      { path: '/staff/reports', element: <ReportsPage /> },
    ],
  },

  // ── Protected Admin Routes ─────────────────────────────────
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin/users', element: <PlaceholderPage title="Gestión de Usuarios" description="Asignación de roles y control (Fase 3/4)" /> },
      { path: '/admin/settings', element: <PlaceholderPage title="Configuración" description="Ajustes del sistema" /> },
    ],
  },

  // ── 404 ────────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
