/**
 * StaffDashboard — Operational dashboard for library staff.
 */

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import StatCard from './StatCard';

interface StaffStats {
  total_books: number;
  active_loans: number;
  overdue_loans: number;
  total_visitors_today: number;
  upcoming_events: number;
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<StaffStats>('/api/dashboard/staff');
        setStats(data);
      } catch (err) {
        setError('Error al cargar métricas operativas.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Cargando métricas operativas...</div>;
  }

  if (error || !stats) {
    return <div style={{ color: 'var(--color-error)' }}>{error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Resumen Operativo
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Métricas actuales del Learning Commons.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        <StatCard
          title="Préstamos Activos"
          value={stats.active_loans}
          icon="🔄"
          color="info"
          description="Ejemplares actualmente prestados"
        />
        <StatCard
          title="Préstamos Vencidos"
          value={stats.overdue_loans}
          icon="⚠️"
          color="error"
          description="Ejemplares no devueltos a tiempo"
        />
        <StatCard
          title="Libros en Catálogo"
          value={stats.total_books}
          icon="📚"
          color="primary"
          description="Títulos registrados"
        />
        <StatCard
          title="Visitantes (Hoy)"
          value={stats.total_visitors_today}
          icon="👥"
          color="info"
          description="Alumnos en las instalaciones"
        />
        <StatCard
          title="Eventos Próximos"
          value={stats.upcoming_events}
          icon="📅"
          color="success"
          description="Eventos calendarizados"
        />
      </div>
    </div>
  );
}
