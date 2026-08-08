import { useState } from 'react';
import { useCreateEvent } from '../hooks/useEvents';

const EVENT_TYPES = [
  { value: 'conference', label: 'Conferencia' },
  { value: 'fair', label: 'Feria' },
  { value: 'workshop', label: 'Taller / Workshop' },
  { value: 'presentation', label: 'Presentación de proyectos' },
  { value: 'special', label: 'Evento especial' },
  { value: 'other', label: 'Otro' },
];

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ onClose, onSuccess }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: 'conference',
    location: '',
    start_time: '',
    end_time: '',
  });

  const { mutate, isPending, error } = useCreateEvent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_time) return;

    // Convert local datetime-local format (YYYY-MM-DDTHH:MM) to ISO string with timezone offset
    // For simplicity, we append Z or convert properly
    const startTimeISO = new Date(formData.start_time).toISOString();
    const endTimeISO = formData.end_time ? new Date(formData.end_time).toISOString() : null;

    mutate(
      {
        name: formData.name,
        description: formData.description || null,
        event_type: formData.event_type || null,
        location: formData.location || null,
        start_time: startTimeISO,
        end_time: endTimeISO,
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
        maxWidth: '550px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} className="animate-fade-in">
        
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>Crear Evento</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && (
            <div style={{ color: 'var(--color-error)', padding: 'var(--space-3)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)' }}>
              {(error as any)?.response?.data?.detail || 'Error al crear evento'}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Nombre del Evento *</label>
            <input 
              required 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
              placeholder="Ej. Taller de Programación en Rust"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Tipo de Evento</label>
            <select 
              value={formData.event_type}
              onChange={e => setFormData({ ...formData, event_type: e.target.value })}
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Descripción</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minHeight: '80px', resize: 'vertical' }} 
              placeholder="Detalles sobre el evento..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Ubicación</label>
            <input 
              type="text" 
              value={formData.location} 
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
              placeholder="Ej. Sala de Usos Múltiples"
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Fecha/Hora de Inicio *</label>
              <input 
                required
                type="datetime-local" 
                value={formData.start_time} 
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Fecha/Hora de Fin</label>
              <input 
                type="datetime-local" 
                value={formData.end_time} 
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
              />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <button type="button" onClick={onClose} style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 'var(--font-weight-medium)' }}>
              {isPending ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
