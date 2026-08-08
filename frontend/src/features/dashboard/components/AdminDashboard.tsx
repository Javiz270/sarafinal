/**
 * AdminDashboard — System-wide dashboard for administrators.
 */

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import StatCard from './StatCard';

interface AdminStats {
  total_books: number;
  active_loans: number;
  total_visitors_today: number;
  upcoming_events: number;
  total_users: number;
  total_staff: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<AdminStats>('/api/dashboard/admin');
        setStats(data);
      } catch (err) {
        setError('Error al cargar métricas del sistema.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Cargando métricas del sistema...</div>;
  }

  if (error || !stats) {
    return <div style={{ color: 'var(--color-error)' }}>{error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Resumen General del Sistema
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Métricas globales y de administración.
        </p>
      </div>

      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>Operaciones</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <StatCard
          title="Préstamos Activos"
          value={stats.active_loans}
          icon="🔄"
          color="warning"
        />
        <StatCard
          title="Libros en Catálogo"
          value={stats.total_books}
          icon="📚"
          color="primary"
        />
        <StatCard
          title="Visitantes (Hoy)"
          value={stats.total_visitors_today}
          icon="👥"
          color="info"
        />
        <StatCard
          title="Eventos Próximos"
          value={stats.upcoming_events}
          icon="📅"
          color="success"
        />
      </div>

      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>Usuarios y Accesos</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        <StatCard
          title="Usuarios Registrados"
          value={stats.total_users}
          icon="🧑‍🎓"
          color="primary"
          description="Total de perfiles creados"
        />
        <StatCard
          title="Personal (Staff/Admin)"
          value={stats.total_staff}
          icon="🛡️"
          color="error"
          description="Cuentas con privilegios elevados"
        />
      </div>
    </div>
  );
}
