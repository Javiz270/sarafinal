/**
 * CubiclesUserPage — View for regular users to see cubicles and history.
 */

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { Cubicle, CubicleUsageHistory } from '../types';
import CubicleCard from './CubicleCard';

export default function CubiclesUserPage() {
  const [cubicles, setCubicles] = useState<Cubicle[]>([]);
  const [history, setHistory] = useState<CubicleUsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cubiclesData, historyData] = await Promise.all([
          api.get<Cubicle[]>('/api/cubicles/'),
          api.get<CubicleUsageHistory[]>('/api/cubicles/my-history')
        ]);
        setCubicles(cubiclesData);
        setHistory(historyData);
      } catch (err) {
        setError('Error al cargar la información de cubículos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Cargando cubículos...</div>;
  }

  if (error) {
    return <div style={{ color: 'var(--color-error)' }}>{error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Cubículos de Estudio
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Consulta la disponibilidad en tiempo real. Para solicitar un cubículo, acércate con el personal bibliotecario.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {cubicles.map(cubicle => (
          <CubicleCard key={cubicle.id} cubicle={cubicle} />
        ))}
        {cubicles.length === 0 && <p>No hay cubículos configurados en el sistema.</p>}
      </div>

      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
          Mi Historial de Uso
        </h2>
        {history.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Aún no has utilizado ningún cubículo.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: 'var(--space-3)' }}>Cubículo</th>
                  <th style={{ padding: 'var(--space-3)' }}>Inicio</th>
                  <th style={{ padding: 'var(--space-3)' }}>Fin</th>
                  <th style={{ padding: 'var(--space-3)' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map(record => (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-3)' }}>{record.cubicle_name}</td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      {new Date(record.start_time).toLocaleString()}
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      {record.end_time ? new Date(record.end_time).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <span style={{
                        padding: 'var(--space-1) var(--space-2)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        background: record.status === 'active' ? 'var(--color-warning-light)' : 'var(--color-success-light)',
                        color: record.status === 'active' ? 'var(--color-warning)' : 'var(--color-success)',
                      }}>
                        {record.status === 'active' ? 'En Uso' : 'Completado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
