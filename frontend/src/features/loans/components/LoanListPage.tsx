import { useState } from 'react';
import { useLoans, useReturnLoan } from '../hooks/useLoans';
import type { LoanWithDetails } from '../../../types/loan';

export function LoanListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: loans, isLoading, isError, error } = useLoans(statusFilter || undefined);
  const returnMutation = useReturnLoan();
  const [returningLoanId, setReturningLoanId] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState('');

  const handleReturn = (loanId: string) => {
    returnMutation.mutate(
      { id: loanId, data: { notes: returnNotes } },
      {
        onSuccess: () => {
          setReturningLoanId(null);
          setReturnNotes('');
        },
      }
    );
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'active') return 'badge-info';
    if (status === 'returned') return 'badge-success';
    if (status === 'overdue') return 'badge-error';
    return 'badge-secondary';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Activo';
    if (status === 'returned') return 'Devuelto';
    if (status === 'overdue') return 'Vencido';
    return status;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Gestión de Préstamos</h1>
          <p className="page-subtitle">Consulte y registre devoluciones de préstamos.</p>
        </div>
      </header>

      <div className="card">
        <div className="filters-bar" style={{ marginBottom: '1rem' }}>
          <label htmlFor="statusFilter">Filtrar por estado: </label>
          <select 
            id="statusFilter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            <option value="active">Activos (incluye vencidos)</option>
            <option value="overdue">Solo Vencidos</option>
            <option value="returned">Devueltos</option>
          </select>
        </div>

        {isLoading ? (
          <p>Cargando préstamos...</p>
        ) : isError ? (
          <p className="error-text">{(error as any).response?.data?.detail || 'Error al cargar préstamos'}</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Ejemplar</th>
                  <th>Libro</th>
                  <th>Usuario</th>
                  <th>Fechas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loans?.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No se encontraron préstamos.
                    </td>
                  </tr>
                )}
                {loans?.map((loan: LoanWithDetails) => (
                  <tr key={loan.id}>
                    <td>
                      <span className="font-mono text-sm">{loan.copy_barcode}</span>
                    </td>
                    <td>
                      <div className="font-medium">{loan.resource_title}</div>
                      <div className="text-sm text-secondary">{loan.resource_author}</div>
                    </td>
                    <td>
                      <div>{loan.user_name}</div>
                      <div className="text-sm text-secondary">{loan.user_email}</div>
                    </td>
                    <td>
                      <div className="text-sm">Prestado: {new Date(loan.loan_date).toLocaleDateString()}</div>
                      <div className="text-sm text-error">Vence: {new Date(loan.due_date).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(loan.status)}`}>
                        {getStatusLabel(loan.status)}
                      </span>
                    </td>
                    <td>
                      {(loan.status === 'active' || loan.status === 'overdue') && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setReturningLoanId(loan.id)}
                        >
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Modal (Simple implementation) */}
      {returningLoanId && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
            <h2>Confirmar Devolución</h2>
            <p>¿Está seguro de que desea registrar la devolución de este ejemplar?</p>
            <div className="form-group">
              <label>Notas (opcional)</label>
              <textarea 
                className="input" 
                value={returnNotes} 
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Observaciones de la devolución..."
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setReturningLoanId(null); setReturnNotes(''); }}
                disabled={returnMutation.isPending}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleReturn(returningLoanId)}
                disabled={returnMutation.isPending}
              >
                {returnMutation.isPending ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
