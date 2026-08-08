/**
 * CubicleCard — displays cubicle status visually.
 */

import type { Cubicle } from '../types';

interface CubicleCardProps {
  cubicle: Cubicle;
  actions?: React.ReactNode;
}

export default function CubicleCard({ cubicle, actions }: CubicleCardProps) {
  const getStatusDisplay = () => {
    switch (cubicle.status) {
      case 'available':
        return { label: 'Disponible', color: 'var(--color-success)', bg: 'var(--color-success-light)' };
      case 'occupied':
        return { label: 'Ocupado', color: 'var(--color-error)', bg: 'var(--color-error-light)' };
      case 'maintenance':
        return { label: 'Mantenimiento', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' };
      default:
        return { label: 'Desconocido', color: 'var(--color-text-secondary)', bg: 'var(--color-bg-alt)' };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
      className="hover:shadow-md"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
          {cubicle.name}
        </h3>
        <span
          style={{
            display: 'inline-block',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            background: statusInfo.bg,
            color: statusInfo.color,
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          aria-label={`Estado: ${statusInfo.label}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        <p>Capacidad: {cubicle.capacity} persona(s)</p>
        
        {cubicle.status === 'occupied' && cubicle.active_user && (
          <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>En uso por:</p>
            <p>{cubicle.active_user.full_name}</p>
            {cubicle.active_reservation?.start_time && (
              <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)' }}>
                Desde: {new Date(cubicle.active_reservation.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}
      </div>

      {actions && (
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
