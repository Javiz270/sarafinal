/**
 * AdminLayout — layout for system administrators.
 * Includes Navbar and Sidebar, protected by ProtectedRoute.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from '../components/layout';
import { ProtectedRoute } from '../features/auth';

export default function AdminLayout() {
  const location = useLocation();
  
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="app-layout__main">
          <div key={location.pathname} className="page-transition-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
