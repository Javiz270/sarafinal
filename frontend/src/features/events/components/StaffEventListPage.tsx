import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { CreateEventModal } from './CreateEventModal';

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: 'Conferencia',
  fair: 'Feria',
  workshop: 'Taller',
  presentation: 'Presentación',
  special: 'Especial',
  other: 'Otro'
};

export function StaffEventListPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: events, isLoading, isError, error, refetch } = useEvents();
  const navigate = useNavigate();

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
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Gestión de Eventos</h1>
          <p className="page-subtitle">Administra los eventos y conferencias del Learning Commons.</p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}
          onClick={() => setShowModal(true)}
        >
          + Crear Evento
        </button>
      </header>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Cargando eventos...</p>
          </div>
        ) : isError ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-error)' }}>
            <p>{error?.response?.data?.detail || 'Error al cargar eventos'}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-3)' }}>Nombre</th>
                  <th style={{ padding: 'var(--space-3)' }}>Tipo</th>
                  <th style={{ padding: 'var(--space-3)' }}>Fecha / Hora</th>
                  <th style={{ padding: 'var(--space-3)' }}>Ubicación</th>
                  <th style={{ padding: 'var(--space-3)' }}>Asistentes</th>
                  <th style={{ padding: 'var(--space-3)' }}>Estado</th>
                  <th style={{ padding: 'var(--space-3)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events?.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
                      No hay eventos creados. ¡Crea el primero!
                    </td>
                  </tr>
                )}
                {events?.map(event => (
                  <tr key={event.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '500' }}>{event.name}</td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      {EVENT_TYPE_LABELS[event.event_type || ''] || 'Otro'}
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      {new Date(event.start_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}{' '}
                      {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>{event.location || 'N/A'}</td>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 'bold' }}>{event.attendee_count}</td>
                    <td style={{ padding: 'var(--space-3)' }}>{getEventStatus(event.start_time)}</td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <button 
                        style={{ padding: '4px 8px', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                        onClick={() => navigate(`/staff/events/${event.id}`)}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CreateEventModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
