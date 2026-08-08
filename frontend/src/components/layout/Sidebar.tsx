/**
 * Sidebar component — navigation sidebar for authenticated users.
 * Generates navigation links dynamically based on the user's role.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth';

type NavItem = {
  path: string;
  label: string;
  icon: string;
  roles: Array<'user' | 'staff' | 'admin'>;
};

const NAV_ITEMS: NavItem[] = [
  // User Routes
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['user', 'staff', 'admin'] },
  { path: '/cubicles', label: 'Cubículos', icon: '🪑', roles: ['user', 'staff', 'admin'] },
  { path: '/books', label: 'Buscar Libros', icon: '📚', roles: ['user', 'staff', 'admin'] },
  { path: '/loans/my-loans', label: 'Mis Préstamos', icon: '🏷️', roles: ['user', 'staff', 'admin'] },
  { path: '/events/upcoming', label: 'Eventos', icon: '🎪', roles: ['user', 'staff', 'admin'] },

  // Staff Routes
  { path: '/staff/loans', label: 'Gestión Préstamos', icon: '🔄', roles: ['staff', 'admin'] },
  { path: '/staff/books', label: 'Gestión Libros', icon: '📖', roles: ['staff', 'admin'] },
  { path: '/staff/visitors', label: 'Visitantes', icon: '👥', roles: ['staff', 'admin'] },
  { path: '/staff/events', label: 'Gestión Eventos', icon: '📅', roles: ['staff', 'admin'] },
  { path: '/staff/statistics', label: 'Estadísticas', icon: '📈', roles: ['staff', 'admin'] },

  // Admin Routes
  { path: '/admin/users', label: 'Usuarios y Roles', icon: '🛡️', roles: ['admin'] },
  { path: '/staff/reports', label: 'Reportes', icon: '📋', roles: ['staff', 'admin'] },
  { path: '/admin/settings', label: 'Configuración', icon: '⚙️', roles: ['admin'] },
];

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const allowedItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="sidebar" aria-label="Menú principal">
      <div className="sidebar__inner">
        <nav className="sidebar__nav">
          <ul className="sidebar__list">
            {allowedItems.map((item) => (
              <li key={item.path} className="sidebar__item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <span className="sidebar__icon">{item.icon}</span>
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
