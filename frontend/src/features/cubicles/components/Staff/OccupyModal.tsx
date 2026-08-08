/**
 * OccupyModal — Form for staff to assign a cubicle to a user.
 */

import { useState } from 'react';
import { api } from '../../../../lib/api';
import type { Cubicle, UserProfileBasic } from '../../types';

interface OccupyModalProps {
  cubicle: Cubicle;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OccupyModal({ cubicle, onClose, onSuccess }: OccupyModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfileBasic[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfileBasic | null>(null);
  const [notes, setNotes] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoadingSearch(true);
    setError(null);
    try {
      // In a real app, we'd have a /api/users search endpoint.
      // We will use the existing /api/users endpoint with a search query.
      const data = await api.get<UserProfileBasic[]>(`/api/users/?search=${encodeURIComponent(searchTerm)}&limit=5`);
      setUsers(data);
      if (data.length === 0) {
        setError('No se encontraron usuarios con ese criterio.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar usuarios.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setLoadingSubmit(true);
    setError(null);
    try {
      await api.post(`/api/cubicles/${cubicle.id}/occupy`, {
        user_id: selectedUser.id,
        notes: notes.trim() ? notes : null
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el uso.');
      setLoadingSubmit(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: 'var(--color-bg)',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }} className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Registrar Uso: {cubicle.name}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {error && <div style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)' }}>{error}</div>}

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
            Buscar Alumno (Nombre o Correo)
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ej. juan@utr.edu.mx"
              style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <button
              onClick={handleSearch}
              disabled={loadingSearch || !searchTerm.trim()}
              className="navbar__btn navbar__btn--primary"
            >
              Buscar
            </button>
          </div>

          {users.length > 0 && !selectedUser && (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              {users.map(u => (
                <li key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => setSelectedUser(u)}
                    style={{ width: '100%', textAlign: 'left', padding: 'var(--space-3)', background: 'none', border: 'none', cursor: 'pointer' }}
                    className="hover:bg-gray-50"
                  >
                    <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{u.full_name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{u.email}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedUser && (
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'block' }}>Usuario seleccionado:</span>
                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{selectedUser.full_name}</span>
                <span style={{ display: 'block', fontSize: 'var(--font-size-sm)' }}>{selectedUser.email}</span>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', textDecoration: 'underline' }}>
                Cambiar
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Material prestado, observaciones..."
              style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button type="button" onClick={onClose} style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedUser || loadingSubmit}
              className="navbar__btn navbar__btn--primary"
            >
              {loadingSubmit ? 'Registrando...' : 'Registrar Uso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
