import { useState, useEffect } from 'react';
import { useCreateVisitor } from '../hooks/useVisitors';
import { useEvents } from '../../events/hooks/useEvents';

const SUGGESTED_REASONS = [
  'Visita general',
  'Conferencia',
  'Feria',
  'Evento especial',
  'Otro'
];

interface RegisterVisitorModalProps {
  onClose: () => void;
  onSuccess: () => void;
  eventId?: string;
}

export function RegisterVisitorModal({ onClose, onSuccess, eventId }: RegisterVisitorModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    reasonSelection: 'Visita general',
    customReason: '',
    selectedEventId: eventId || '',
  });

  const { data: events } = useEvents();
  const { mutate, isPending, error } = useCreateVisitor();

  // If eventId changes, update state
  useEffect(() => {
    if (eventId) {
      setFormData(prev => ({ ...prev, selectedEventId: eventId }));
    }
  }, [eventId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalReason = formData.reasonSelection === 'Otro' 
      ? formData.customReason 
      : formData.reasonSelection;

    // If an event is selected, auto-append/set event context in reason if reason is general
    if (formData.selectedEventId && events) {
      const selectedEvent = events.find(ev => ev.id === formData.selectedEventId);
      if (selectedEvent && finalReason === 'Visita general') {
        finalReason = `Asistencia a evento: ${selectedEvent.name}`;
      }
    }

    mutate(
      {
        full_name: formData.full_name,
        reason: finalReason,
        event_id: formData.selectedEventId || null,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        background: 'var(--color-bg)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} className="animate-fade-in">
        
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>Registrar Visitante</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && (
            <div style={{ color: 'var(--color-error)', padding: 'var(--space-3)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)' }}>
              {(error as any)?.response?.data?.detail || 'Error al registrar visitante'}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Nombre Completo *</label>
            <input 
              required 
              type="text" 
              value={formData.full_name} 
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
              placeholder="Nombre del visitante"
            />
          </div>

          {!eventId && (
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Asociar a Evento (Opcional)</label>
              <select 
                value={formData.selectedEventId}
                onChange={e => setFormData({ ...formData, selectedEventId: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              >
                <option value="">-- No asociar a ningún evento --</option>
                {events?.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} ({new Date(ev.start_time).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Motivo *</label>
            <select 
              value={formData.reasonSelection}
              onChange={e => setFormData({ ...formData, reasonSelection: e.target.value })}
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-2)' }}
            >
              {SUGGESTED_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            
            {formData.reasonSelection === 'Otro' && (
              <input 
                required 
                type="text" 
                value={formData.customReason} 
                onChange={e => setFormData({ ...formData, customReason: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
                placeholder="Especifique el motivo"
              />
            )}
          </div>

          <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button type="button" onClick={onClose} style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 'var(--font-weight-medium)' }}>
              {isPending ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
