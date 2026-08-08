import { useEvents } from '../hooks/useEvents';

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: 'Conferencia',
  fair: 'Feria',
  workshop: 'Taller',
  presentation: 'Presentación',
  special: 'Especial',
  other: 'Otro'
};

export function UserEventListPage() {
  const { data: events, isLoading, isError, error } = useEvents();

  const getEventStatus = (startTimeStr: string) => {
    const isUpcoming = new Date(startTimeStr) >= new Date();
    return isUpcoming ? (
      <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 'bold' }}>Próximo</span>
    ) : (
      <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 'bold' }}>Pasado</span>
    );
  };

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Eventos del Learning Commons</h1>
        <p className="page-subtitle">Explora las actividades, talleres y conferencias disponibles.</p>
      </header>

      {isLoading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Cargando eventos...</p>
        </div>
      ) : isError ? (
        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
          <p>{error?.response?.data?.detail || 'Error al cargar eventos'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {events?.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No hay eventos programados en este momento.
            </div>
          )}
          {events?.map(event => (
            <div key={event.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    {EVENT_TYPE_LABELS[event.event_type || ''] || 'Evento'}
                  </span>
                  {getEventStatus(event.start_time)}
                </div>
                
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>{event.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', minHeight: '40px' }}>
                  {event.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span> <span>{event.location || 'Learning Commons'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📅</span> <span>
                    {new Date(event.start_time).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⏰</span> <span>
                    {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
