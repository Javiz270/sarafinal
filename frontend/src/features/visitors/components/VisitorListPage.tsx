import { useState } from 'react';
import { useVisitors, useCheckoutVisitor } from '../hooks/useVisitors';
import { RegisterVisitorModal } from './RegisterVisitorModal';

export function VisitorListPage() {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    date_filter: '',
    inside_only: false
  });
  
  // Realiza fetch con los filtros aplicados
  const { data: visitors, isLoading, isError, error, refetch } = useVisitors({
    search: filters.search || undefined,
    date_filter: filters.date_filter || undefined,
    inside_only: filters.inside_only || undefined
  });
  
  const checkoutMutation = useCheckoutVisitor();

  const handleCheckout = (id: string) => {
    checkoutMutation.mutate(id, {
      onSuccess: () => refetch()
    });
  };

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Gestión de Visitantes</h1>
          <p className="page-subtitle">Registro y control de acceso de visitantes externos.</p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}
          onClick={() => setShowModal(true)}
        >
          + Registrar Visitante
        </button>
      </header>

      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.875rem' }}>Buscar Nombre</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ej. Juan Pérez"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.875rem' }}>Fecha</label>
            <input 
              type="date" 
              className="input" 
              value={filters.date_filter}
              onChange={e => setFilters({ ...filters, date_filter: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', height: '40px' }}>
            <input 
              type="checkbox" 
              id="insideOnly"
              checked={filters.inside_only}
              onChange={e => setFilters({ ...filters, inside_only: e.target.checked })}
            />
            <label htmlFor="insideOnly" style={{ cursor: 'pointer' }}>Actualmente dentro</label>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Cargando visitantes...</p>
          </div>
        ) : isError ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-error)' }}>
            <p>{(error as any)?.response?.data?.detail || 'Error al cargar visitantes'}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-3)' }}>Nombre</th>
                  <th style={{ padding: 'var(--space-3)' }}>Motivo</th>
                  <th style={{ padding: 'var(--space-3)' }}>Entrada</th>
                  <th style={{ padding: 'var(--space-3)' }}>Salida</th>
                  <th style={{ padding: 'var(--space-3)' }}>Registrado por</th>
                  <th style={{ padding: 'var(--space-3)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visitors?.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
                      No se encontraron visitantes.
                    </td>
                  </tr>
                )}
                {visitors?.map(visitor => {
                  const isInside = !visitor.check_out;
                  return (
                    <tr key={visitor.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3)', fontWeight: '500' }}>{visitor.full_name}</td>
                      <td style={{ padding: 'var(--space-3)' }}>{visitor.reason}</td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        {new Date(visitor.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        {isInside ? (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-info-light)', color: 'var(--color-info)', fontSize: '0.75rem', fontWeight: 'bold' }}>Dentro</span>
                        ) : (
                          new Date(visitor.check_out!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {visitor.registered_by_name || 'Desconocido'}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        {isInside ? (
                          <button 
                            style={{ padding: '4px 8px', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                            onClick={() => handleCheckout(visitor.id)}
                            disabled={checkoutMutation.isPending}
                          >
                            Registrar salida
                          </button>
                        ) : (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 'bold' }}>Salida registrada</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <RegisterVisitorModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
