/**
 * CubiclesStaffPage — View for staff to manage cubicles.
 */

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import type { Cubicle } from '../../types';
import CubicleCard from '../CubicleCard';
import OccupyModal from './OccupyModal';

export default function CubiclesStaffPage() {
  const [cubicles, setCubicles] = useState<Cubicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [occupyingCubicle, setOccupyingCubicle] = useState<Cubicle | null>(null);

  const fetchCubicles = async () => {
    try {
      const data = await api.get<Cubicle[]>('/api/cubicles/');
      setCubicles(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la información de cubículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCubicles();
  }, []);

  const handleRelease = async (id: string) => {
    if (!window.confirm('¿Confirmas la liberación de este cubículo?')) return;
    try {
      await api.post(`/api/cubicles/${id}/release`);
      fetchCubicles();
    } catch (err: any) {
      alert(err.message || 'Error al liberar el cubículo');
    }
  };

  const handleMaintenance = async (id: string, isMaintenance: boolean) => {
    try {
      if (isMaintenance) {
        await api.post(`/api/cubicles/${id}/available`);
      } else {
        await api.post(`/api/cubicles/${id}/maintenance`);
      }
      fetchCubicles();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado de mantenimiento');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Cargando gestión de cubículos...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Gestión de Cubículos
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Administra la ocupación y mantenimiento de los cubículos del Learning Commons.
        </p>
      </div>

      {error && <div style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {cubicles.map(cubicle => (
          <CubicleCard
            key={cubicle.id}
            cubicle={cubicle}
            actions={
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {cubicle.status === 'available' && (
                  <button
                    onClick={() => setOccupyingCubicle(cubicle)}
                    className="navbar__btn navbar__btn--primary"
                    style={{ flex: 1 }}
                  >
                    Registrar Uso
                  </button>
                )}
                
                {cubicle.status === 'occupied' && (
                  <button
                    onClick={() => handleRelease(cubicle.id)}
                    style={{ flex: 1, padding: 'var(--space-2)', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    Registrar Salida
                  </button>
                )}

                <button
                  onClick={() => handleMaintenance(cubicle.id, cubicle.status === 'maintenance')}
                  style={{
                    padding: 'var(--space-2)',
                    background: cubicle.status === 'maintenance' ? 'var(--color-info)' : 'var(--color-bg-alt)',
                    color: cubicle.status === 'maintenance' ? 'white' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                  disabled={cubicle.status === 'occupied'}
                  title={cubicle.status === 'occupied' ? "No se puede poner en mantenimiento un cubículo ocupado" : ""}
                >
                  {cubicle.status === 'maintenance' ? 'Marcar Disponible' : 'Mantenimiento'}
                </button>
              </div>
            }
          />
        ))}
      </div>

      {occupyingCubicle && (
        <OccupyModal
          cubicle={occupyingCubicle}
          onClose={() => setOccupyingCubicle(null)}
          onSuccess={() => {
            setOccupyingCubicle(null);
            fetchCubicles();
          }}
        />
      )}
    </div>
  );
}
