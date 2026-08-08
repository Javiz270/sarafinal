/**
 * ManageCopiesModal — Allows staff to register physical copies (barcodes) for a resource.
 */

import { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import type { ResourceResponse, BookCopy } from '../../types';

interface ManageCopiesModalProps {
  resource: ResourceResponse;
  onClose: () => void;
}

export default function ManageCopiesModal({ resource, onClose }: ManageCopiesModalProps) {
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newBarcode, setNewBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchCopies = async () => {
    try {
      const data = await api.get<BookCopy[]>(`/api/resources/${resource.id}/copies`);
      setCopies(data);
    } catch (err) {
      setError('Error al cargar los ejemplares.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCopies();
  }, [resource.id]);

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode.trim()) return;

    setAdding(true);
    setError(null);
    try {
      await api.post(`/api/resources/${resource.id}/copies`, { barcode: newBarcode.trim() });
      setNewBarcode('');
      fetchCopies();
      // Inform the user that copies count has updated (in a real app, we might propagate this to parent)
    } catch (err: any) {
      setError(err.message || 'Error al registrar el ejemplar.');
    } finally {
      setAdding(false);
    }
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
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} className="animate-fade-in">
        
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>Ejemplares Físicos</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div style={{ padding: 'var(--space-6)' }}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-1)' }}>{resource.title}</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Añade los códigos de barras internos para los libros físicos.</p>
          </div>

          {error && <div style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)' }}>{error}</div>}

          <form onSubmit={handleAddCopy} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <input
              type="text"
              value={newBarcode}
              onChange={(e) => setNewBarcode(e.target.value)}
              placeholder="Ej. CAS-001, 123456789"
              required
              style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <button type="submit" disabled={adding || !newBarcode.trim()} className="navbar__btn navbar__btn--primary">
              {adding ? 'Registrando...' : 'Registrar'}
            </button>
          </form>

          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-3)' }}>
              Ejemplares Registrados ({copies.length})
            </h4>
            
            {loading ? (
              <p>Cargando ejemplares...</p>
            ) : copies.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No hay ejemplares registrados.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                {copies.map((copy, i) => (
                  <li key={copy.id} style={{ 
                    padding: 'var(--space-3)', 
                    borderBottom: i < copies.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{copy.barcode}</span>
                    <span style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      padding: 'var(--space-1) var(--space-2)', 
                      background: 'var(--color-bg-alt)', 
                      borderRadius: 'var(--radius-full)' 
                    }}>
                      {copy.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
