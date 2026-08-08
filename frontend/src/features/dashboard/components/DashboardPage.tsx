/**
 * DashboardPage — Main entry point for the /dashboard route.
 * Renders the correct dashboard component based on the user's role.
 */

import { useAuth } from '../../auth';
import UserDashboard from './UserDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
}
