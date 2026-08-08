import { useState } from 'react';
import { useMyLoans } from '../hooks/useLoans';
import type { LoanWithDetails } from '../../../types/loan';

export function UserLoanListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: loans, isLoading, isError, error } = useMyLoans(statusFilter || undefined);

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
          <h1 className="page-title">Mis Préstamos</h1>
          <p className="page-subtitle">Consulta tu historial de libros prestados.</p>
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
            <option value="active">Activos</option>
            <option value="overdue">Vencidos</option>
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
                  <th>Libro</th>
                  <th>Ejemplar</th>
                  <th>Fechas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loans?.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                      No tienes préstamos registrados.
                    </td>
                  </tr>
                )}
                {loans?.map((loan: LoanWithDetails) => (
                  <tr key={loan.id}>
                    <td>
                      <div className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {loan.cover_url ? (
                          <img src={loan.cover_url} alt="Cover" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '40px', height: '60px', background: 'var(--color-surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--color-text-tertiary)', borderRadius: '4px' }}>Sin portada</div>
                        )}
                        <div>
                          <div>{loan.resource_title}</div>
                          <div className="text-sm text-secondary">{loan.resource_author}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-sm">{loan.copy_barcode}</span>
                    </td>
                    <td>
                      <div className="text-sm">Prestado: {new Date(loan.loan_date).toLocaleDateString()}</div>
                      <div className="text-sm text-error">Vence: {new Date(loan.due_date).toLocaleDateString()}</div>
                      {loan.return_date && (
                        <div className="text-sm text-success">Devuelto: {new Date(loan.return_date).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(loan.status)}`}>
                        {getStatusLabel(loan.status)}
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
