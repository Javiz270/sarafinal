import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBarcodeLookup, useCreateLoan } from '../hooks/useLoans';
import { api } from '../../../lib/api';
import type { User } from '../../../types';
import './GenerateLoanPage.css';

export function GenerateLoanPage() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [userError, setUserError] = useState('');

  const lookupMutation = useBarcodeLookup();
  const createMutation = useCreateLoan();

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      lookupMutation.mutate(barcode.trim());
    }
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    if (!searchEmail.trim()) return;

    try {
      const res = await api.get<User[]>(`/api/users/?search=${encodeURIComponent(searchEmail.trim())}`);
      if (res && res.length > 0) {
        setSelectedUser(res[0]);
      } else {
        setSelectedUser(null);
        setUserError('Usuario no encontrado');
      }
    } catch {
      setSelectedUser(null);
      setUserError('Error al buscar usuario. Verifique permisos de admin.');
    }
  };

  const handleCreate = () => {
    if (!lookupMutation.data || !selectedUser || !dueDate) return;

    createMutation.mutate(
      {
        barcode: lookupMutation.data.barcode,
        user_id: selectedUser.id,
        due_date: new Date(dueDate).toISOString(),
      },
      {
        onSuccess: () => {
          navigate('/loans');
        },
      }
    );
  };

  return (
    <div className="page-container generate-loan-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Generar Préstamo</h1>
          <p className="page-subtitle">Escanee el código de barras y seleccione el usuario.</p>
        </div>
      </header>

      <div className="loan-flow">
        {/* Step 1: Barcode */}
        <div className="card step-card">
          <h2>1. Ejemplar</h2>
          <form onSubmit={handleLookup} className="form-group">
            <label htmlFor="barcode">Código de Barras</label>
            <div className="input-group">
              <input
                id="barcode"
                type="text"
                placeholder="Ej. CAS-001"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={lookupMutation.isPending}>
                Buscar
              </button>
            </div>
          </form>

          {lookupMutation.isPending && <p>Buscando...</p>}
          {lookupMutation.isError && <p className="error-text">{(lookupMutation.error as any).response?.data?.detail || 'Error al buscar ejemplar'}</p>}
          
          {lookupMutation.data && (
            <div className="book-card">
              {lookupMutation.data.cover_url ? (
                <img src={lookupMutation.data.cover_url} alt="Cover" className="book-cover-small" />
              ) : (
                <div className="book-cover-placeholder">Sin portada</div>
              )}
              <div className="book-details">
                <h3>{lookupMutation.data.title}</h3>
                <p className="text-secondary">{lookupMutation.data.author}</p>
                <span className={`badge ${lookupMutation.data.status === 'available' ? 'badge-success' : 'badge-error'}`}>
                  {lookupMutation.data.status === 'available' ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: User */}
        {lookupMutation.data?.status === 'available' && (
          <div className="card step-card">
            <h2>2. Usuario</h2>
            <form onSubmit={handleSearchUser} className="form-group">
              <label htmlFor="userSearch">Correo Institucional o Nombre</label>
              <div className="input-group">
                <input
                  id="userSearch"
                  type="text"
                  placeholder="ejemplo@utr.edu.mx"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary">Buscar</button>
              </div>
            </form>

            {userError && <p className="error-text">{userError}</p>}

            {selectedUser && (
              <div className="user-card">
                <div className="user-avatar">{selectedUser.full_name?.charAt(0) || 'U'}</div>
                <div className="user-details">
                  <h3>{selectedUser.full_name}</h3>
                  <p className="text-secondary">{selectedUser.email}</p>
                  {(selectedUser.career || selectedUser.group) && (
                    <p className="text-secondary text-sm">{selectedUser.career} - {selectedUser.group}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {lookupMutation.data?.status === 'available' && selectedUser && (
          <div className="card step-card">
            <h2>3. Confirmación</h2>
            <div className="form-group">
              <label htmlFor="dueDate">Fecha Límite</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="summary-box">
              <p><strong>Libro:</strong> {lookupMutation.data.title}</p>
              <p><strong>Usuario:</strong> {selectedUser.full_name}</p>
              <p><strong>Ejemplar:</strong> {lookupMutation.data.barcode}</p>
            </div>

            <button 
              className="btn btn-primary btn-block" 
              onClick={handleCreate}
              disabled={!dueDate || createMutation.isPending}
            >
              {createMutation.isPending ? 'Generando...' : 'Confirmar Préstamo'}
            </button>
            {createMutation.isError && <p className="error-text">{(createMutation.error as any).response?.data?.detail || 'Error al crear préstamo'}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
