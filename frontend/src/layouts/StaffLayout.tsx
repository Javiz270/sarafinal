/**
 * StaffLayout — layout for library staff members.
 * Includes Navbar and Sidebar, protected by ProtectedRoute.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from '../components/layout';
import { ProtectedRoute } from '../features/auth';

export default function StaffLayout() {
  const location = useLocation();
  
  return (
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
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
