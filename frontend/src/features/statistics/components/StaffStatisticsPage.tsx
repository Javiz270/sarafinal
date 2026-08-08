import { useState } from 'react';
import { useGlobalStatistics } from '../hooks/useStatistics';
import StatCard from '../../dashboard/components/StatCard';

const PERIODS = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mes' },
  { value: 'year', label: 'Este Año' },
  { value: 'custom', label: 'Personalizado' },
];

export function StaffStatisticsPage() {
  const [period, setPeriod] = useState('month');
  const [dates, setDates] = useState({
    start_date: '',
    end_date: '',
  });

  // Query statistics dynamically
  const { data, isLoading, isError, error } = useGlobalStatistics({
    period,
    start_date: period === 'custom' && dates.start_date ? new Date(dates.start_date).toISOString() : undefined,
    end_date: period === 'custom' && dates.end_date ? new Date(dates.end_date).toISOString() : undefined,
  });

  const maxCubicleUses = data ? Math.max(...data.cubicles.map(c => c.uses), 1) : 1;
  const totalVisitorReasons = data ? Object.values(data.visitors.reasons).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="page-container page-transition-enter">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Estadísticas y Análisis</h1>
          <p className="page-subtitle">Uso e indicadores del Learning Commons en tiempo real.</p>
        </div>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <select 
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {period === 'custom' && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <input 
                type="date"
                value={dates.start_date}
                onChange={e => setDates({ ...dates, start_date: e.target.value })}
                style={{ padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
              <span>a</span>
              <input 
                type="date"
                value={dates.end_date}
                onChange={e => setDates({ ...dates, end_date: e.target.value })}
                style={{ padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
          )}
        </div>
      </header>

      {isLoading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Calculando indicadores...</p>
        </div>
      ) : isError || !data ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-error)' }}>
          <p>{error?.response?.data?.detail || 'Error al calcular estadísticas'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <StatCard 
              title="Préstamos Totales" 
              value={data.loans.total} 
              icon="🏷️" 
              color="primary"
              description="Registrados en el periodo"
            />
            <StatCard 
              title="Préstamos Activos" 
              value={data.loans.active} 
              icon="📖" 
              color="info"
              description="Libros no devueltos"
            />
            <StatCard 
              title="Préstamos Vencidos" 
              value={data.loans.overdue} 
              icon="⚠️" 
              color="error"
              description="Requieren atención"
            />
            <StatCard 
              title="Visitantes del Periodo" 
              value={data.visitors.period_total} 
              icon="👥" 
              color="success"
              description={`Hoy entraron: ${data.visitors.today}`}
            />
          </div>

          {/* Breakdown Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
            
            {/* Cubicles Usage */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Uso de Cubículos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {data.cubicles.map(cub => {
                  const percentage = (cub.uses / maxCubicleUses) * 100;
                  return (
                    <div key={cub.code} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <strong>{cub.name} ({cub.code})</strong>
                        <span>{cub.uses} usos</span>
                      </div>
                      <div style={{ width: '100%', height: '12px', background: 'var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '6px', transition: 'width 0.5s ease-in-out' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Books */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Libros Más Solicitados</h2>
              {data.loans.popular_books.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>No hay registros de préstamos en este periodo.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {data.loans.popular_books.map((book, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <strong>{idx + 1}. {book.title}</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{book.author || 'Autor desconocido'}</p>
                      </div>
                      <span style={{ fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                        {book.loans_count} préstamos
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visitor Reason Breakdown */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Motivos de Visita</h2>
              {totalVisitorReasons === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>No hay visitas registradas en este periodo.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {Object.entries(data.visitors.reasons).map(([reason, count]) => {
                    const percentage = totalVisitorReasons > 0 ? Math.round((count / totalVisitorReasons) * 100) : 0;
                    return (
                      <div key={reason} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>{reason}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-success)', borderRadius: '4px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Events Popularity */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Eventos con Mayor Asistencia</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-2)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <div>📅 Concluidos: <strong>{data.events.completed}</strong></div>
                  <div>🎪 Próximos: <strong>{data.events.upcoming}</strong></div>
                </div>
                {data.events.popular_events.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>No hay eventos programados en este periodo.</p>
                ) : (
                  data.events.popular_events.map((ev, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ fontWeight: '500' }}>{ev.name}</span>
                      <span style={{ fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-info-light)', color: 'var(--color-info)', fontSize: '0.85rem' }}>
                        {ev.attendees_count} asistentes
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
