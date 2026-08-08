import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useEventAttendees, useRegisterAttendee } from '../hooks/useEvents';
import { RegisterVisitorModal } from '../../visitors/components/RegisterVisitorModal';
import { api } from '../../../lib/api';
import type { User } from '../../../types';

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: 'Conferencia',
  fair: 'Feria',
  workshop: 'Taller',
  presentation: 'Presentación',
  special: 'Especial',
  other: 'Otro'
};

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  if (!id) {
    return <div className="page-container">ID de evento inválido.</div>;
  }

  const { data: event, isLoading: isEventLoading, isError: isEventError, error: eventError } = useEvent(id);
  const { data: attendees, isLoading: isAttendeesLoading, refetch: refetchAttendees } = useEventAttendees(id);
  
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userError, setUserError] = useState('');
  const [searchVisitorName, setSearchVisitorName] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<{ id: string; full_name: string; institution?: string | null } | null>(null);
  const [visitorError, setVisitorError] = useState('');
  
  const [attendeeType, setAttendeeType] = useState<'user' | 'visitor'>('user');

  const registerMutation = useRegisterAttendee();

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setSelectedUser(null);
    if (!searchEmail.trim()) return;

    try {
      const res = await api.get<User[]>(`/api/users/?search=${encodeURIComponent(searchEmail.trim())}`);
      if (res && res.length > 0) {
        setSelectedUser(res[0]);
      } else {
        setUserError('Usuario no encontrado');
      }
    } catch {
      setUserError('Error al buscar usuario');
    }
  };

  const handleSearchVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorError('');
    setSelectedVisitor(null);
    if (!searchVisitorName.trim()) return;

    try {
      // Fetch visitors with search term
      const res = await api.get<any[]>(`/api/visitors/?search=${encodeURIComponent(searchVisitorName.trim())}`);
      if (res && res.length > 0) {
        setSelectedVisitor(res[0]); // Select first match
      } else {
        setVisitorError('Visitante no registrado previamente');
      }
    } catch {
      setVisitorError('Error al buscar visitante');
    }
  };

  const handleAddAttendee = () => {
    if (attendeeType === 'user' && selectedUser) {
      registerMutation.mutate(
        id,
        { user_id: selectedUser.id },
        {
          onSuccess: () => {
            refetchAttendees();
            setSelectedUser(null);
            setSearchEmail('');
          }
        }
      );
    } else if (attendeeType === 'visitor' && selectedVisitor) {
      registerMutation.mutate(
        id,
        { visitor_id: selectedVisitor.id },
        {
          onSuccess: () => {
            refetchAttendees();
            setSelectedVisitor(null);
            setSearchVisitorName('');
          }
        }
      );
    }
  };

  if (isEventLoading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
        <p style={{ marginTop: 'var(--space-4)' }}>Cargando detalles del evento...</p>
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className="page-container">
        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
          <p>{(eventError as any)?.response?.data?.detail || 'Error al cargar detalles del evento'}</p>
          <button className="btn" onClick={() => navigate('/staff/events')} style={{ marginTop: 'var(--space-4)' }}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(event.start_time) >= new Date();

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button 
            onClick={() => navigate('/staff/events')}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', marginBottom: 'var(--space-2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Volver a Eventos
          </button>
          <h1 className="page-title">{event.name}</h1>
          <p className="page-subtitle">
            <span style={{ marginRight: 'var(--space-2)' }}>
              {EVENT_TYPE_LABELS[event.event_type || ''] || 'Otro'}
            </span>
            {isUpcoming ? (
              <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 'bold' }}>Próximo</span>
            ) : (
              <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 'bold' }}>Pasado</span>
            )}
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* Left Side: Attendees & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Descripción del Evento</h2>
            <p style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
              {event.description || 'Sin descripción disponible.'}
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>Asistentes ({attendees?.length || 0})</h2>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 12px', fontSize: '0.875rem' }}
                onClick={() => setShowVisitorModal(true)}
              >
                + Registrar Nuevo Visitante
              </button>
            </div>

            {isAttendeesLoading ? (
              <p>Cargando asistentes...</p>
            ) : attendees?.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-6)' }}>
                Ningún asistente registrado aún.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: 'var(--space-2)' }}>Nombre</th>
                      <th style={{ padding: 'var(--space-2)' }}>Tipo</th>
                      <th style={{ padding: 'var(--space-2)' }}>Detalle / Institución</th>
                      <th style={{ padding: 'var(--space-2)' }}>Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees?.map(att => (
                      <tr key={att.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: 'var(--space-3)', fontWeight: '500' }}>
                          {att.user_id ? att.user_name : att.visitor_name}
                        </td>
                        <td style={{ padding: 'var(--space-3)' }}>
                          {att.user_id ? (
                            <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 'bold' }}>Alumno/Docente</span>
                          ) : (
                            <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'var(--color-info-light)', color: 'var(--color-info)', fontSize: '0.75rem', fontWeight: 'bold' }}>Visitante</span>
                          )}
                        </td>
                        <td style={{ padding: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                          {att.user_id ? 'Usuario S.A.R.A.' : (att.visitor_institution || 'Externo')}
                        </td>
                        <td style={{ padding: 'var(--space-3)', fontSize: '0.875rem' }}>
                          {new Date(att.registered_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Event info & Add Attendee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', marginBottom: 'var(--space-3)' }}>Detalles de Ubicación y Fecha</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.9rem' }}>
              <div>
                <strong>📍 Ubicación:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>{event.location || 'No especificada'}</p>
              </div>
              <div>
                <strong>📅 Inicio:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>
                  {new Date(event.start_time).toLocaleString()}
                </p>
              </div>
              {event.end_time && (
                <div>
                  <strong>📅 Fin:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>
                    {new Date(event.end_time).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', marginBottom: 'var(--space-3)' }}>Registrar Asistencia</h3>
            
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-3)' }}>
              <button 
                onClick={() => setAttendeeType('user')}
                style={{ flex: 1, padding: 'var(--space-2)', border: 'none', background: 'none', borderBottom: attendeeType === 'user' ? '2px solid var(--color-primary)' : 'none', fontWeight: attendeeType === 'user' ? 'bold' : 'normal', cursor: 'pointer' }}
              >
                Interno
              </button>
              <button 
                onClick={() => setAttendeeType('visitor')}
                style={{ flex: 1, padding: 'var(--space-2)', border: 'none', background: 'none', borderBottom: attendeeType === 'visitor' ? '2px solid var(--color-primary)' : 'none', fontWeight: attendeeType === 'visitor' ? 'bold' : 'normal', cursor: 'pointer' }}
              >
                Externo
              </button>
            </div>

            {registerMutation.isError && (
              <div style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginBottom: 'var(--space-2)' }}>
                {registerMutation.error?.response?.data?.detail || 'Error al registrar asistencia'}
              </div>
            )}

            {attendeeType === 'user' ? (
              <form onSubmit={handleSearchUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: '0.8rem' }}>Buscar por Correo o Nombre</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input 
                    type="text" 
                    placeholder="correo@utr.edu.mx"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Buscar</button>
                </div>
                {userError && <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: 0 }}>{userError}</p>}
                
                {selectedUser && (
                  <div style={{ padding: 'var(--space-2)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{selectedUser.full_name}</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: 0 }}>{selectedUser.email}</p>
                    <button 
                      type="button" 
                      onClick={handleAddAttendee}
                      className="btn btn-primary"
                      disabled={registerMutation.isPending}
                      style={{ width: '100%', marginTop: 'var(--space-2)', padding: '6px', fontSize: '0.9rem' }}
                    >
                      Registrar
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleSearchVisitor} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: '0.8rem' }}>Buscar por Nombre de Visitante</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input 
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    value={searchVisitorName}
                    onChange={e => setSearchVisitorName(e.target.value)}
                    style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Buscar</button>
                </div>
                {visitorError && <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: 0 }}>{visitorError}</p>}

                {selectedVisitor && (
                  <div style={{ padding: 'var(--space-2)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{selectedVisitor.full_name}</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: 0 }}>{selectedVisitor.institution || 'Sin institución'}</p>
                    <button 
                      type="button" 
                      onClick={handleAddAttendee}
                      className="btn btn-primary"
                      disabled={registerMutation.isPending}
                      style={{ width: '100%', marginTop: 'var(--space-2)', padding: '6px', fontSize: '0.9rem' }}
                    >
                      Registrar
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {showVisitorModal && (
        <RegisterVisitorModal 
          onClose={() => setShowVisitorModal(false)}
          onSuccess={() => {
            setShowVisitorModal(false);
            refetchAttendees();
          }}
        />
      )}
    </div>
  );
}
