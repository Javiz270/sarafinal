/**
 * UserDashboard — Personal dashboard for regular users.
 */

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import StatCard from './StatCard';
import { useAuth } from '../../auth';

interface UserStats {
  loans_total: number;
  loans_active: number;
  loans_returned: number;
  cubicles_used: number;
  events_attended: number;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<UserStats>('/api/dashboard/user');
        setStats(data);
      } catch (err) {
        setError('Error al cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Cargando tu resumen...</div>;
  }

  if (error || !stats) {
    return <div style={{ color: 'var(--color-error)' }}>{error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          ¡Hola, {user?.full_name?.split(' ')[0] || user?.email.split('@')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Aquí tienes un resumen de tu actividad en el Learning Commons.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        <StatCard
          title="Préstamos Activos"
          value={stats.loans_active}
          icon="📚"
          color={stats.loans_active > 0 ? 'primary' : 'info'}
          description="Libros actualmente en tu poder"
        />
        <StatCard
          title="Libros Devueltos"
          value={stats.loans_returned}
          icon="✅"
          color="success"
          description="Total histórico de devoluciones"
        />
        <StatCard
          title="Cubículos Usados"
          value={stats.cubicles_used}
          icon="🪑"
          color="warning"
          description="Reservas completadas"
        />
        <StatCard
          title="Eventos Asistidos"
          value={stats.events_attended}
          icon="🎪"
          color="primary"
          description="Participaciones en eventos"
        />
      </div>
      
      {/* En futuras fases, aquí podríamos agregar secciones como "Libros Recomendados" o "Eventos Próximos" */}
    </div>
  );
}
