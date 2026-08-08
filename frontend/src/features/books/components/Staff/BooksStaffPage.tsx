/**
 * BooksStaffPage — View for staff to manage catalog (internal and external search).
 */

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import type { ResourceResponse, GoogleBookSearchResult, GoogleBookItem } from '../../types';
import BookCard from '../BookCard';
import AddResourceModal from './AddResourceModal';
import ManageCopiesModal from './ManageCopiesModal';

export default function BooksStaffPage() {
  const [tab, setTab] = useState<'internal' | 'external'>('internal');
  
  // Internal State
  const [internalBooks, setInternalBooks] = useState<ResourceResponse[]>([]);
  const [internalQuery, setInternalQuery] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [selectedInternalBook, setSelectedInternalBook] = useState<ResourceResponse | null>(null);
  
  // External State (Google Books)
  const [externalResults, setExternalResults] = useState<GoogleBookItem[]>([]);
  const [externalQuery, setExternalQuery] = useState('');
  const [externalLoading, setExternalLoading] = useState(false);
  const [selectedExternalBook, setSelectedExternalBook] = useState<GoogleBookItem | null>(null);

  const fetchInternalBooks = async (query = '') => {
    setInternalLoading(true);
    try {
      const data = await api.get<ResourceResponse[]>(`/api/resources/?q=${encodeURIComponent(query)}`);
      setInternalBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'internal') {
      fetchInternalBooks(internalQuery);
    }
  }, [tab]);

  const handleInternalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInternalBooks(internalQuery);
  };

  const handleExternalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalQuery.trim()) return;
    
    setExternalLoading(true);
    try {
      const data = await api.get<GoogleBookSearchResult>(`/api/resources/search?q=${encodeURIComponent(externalQuery)}`);
      setExternalResults(data.items || []);
    } catch (err) {
      alert('Error al buscar en Google Books');
    } finally {
      setExternalLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Gestión de Libros
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Administra el catálogo de S.A.R.A. o busca libros externos para agregar.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setTab('internal')}
          style={{
            background: 'none',
            border: 'none',
            padding: 'var(--space-2) var(--space-4)',
            cursor: 'pointer',
            borderBottom: tab === 'internal' ? '2px solid var(--color-primary)' : '2px solid transparent',
            fontWeight: tab === 'internal' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
            color: tab === 'internal' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          Inventario S.A.R.A.
        </button>
        <button
          onClick={() => setTab('external')}
          style={{
            background: 'none',
            border: 'none',
            padding: 'var(--space-2) var(--space-4)',
            cursor: 'pointer',
            borderBottom: tab === 'external' ? '2px solid var(--color-primary)' : '2px solid transparent',
            fontWeight: tab === 'external' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
            color: tab === 'external' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          Buscar en Google Books
        </button>
      </div>

      {tab === 'internal' && (
        <div>
          <form onSubmit={handleInternalSearch} style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: '600px', marginBottom: 'var(--space-6)' }}>
            <input
              type="text"
              value={internalQuery}
              onChange={(e) => setInternalQuery(e.target.value)}
              placeholder="Buscar por título, autor o código..."
              style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <button type="submit" className="navbar__btn navbar__btn--primary">
              Buscar Interno
            </button>
          </form>

          {internalLoading ? (
            <p>Cargando catálogo...</p>
          ) : internalBooks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {internalBooks.map(book => (
                <div key={book.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <BookCard book={book} />
                  <button 
                    onClick={() => setSelectedInternalBook(book)}
                    style={{ padding: 'var(--space-2)', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    Gestionar Ejemplares
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)' }}>No se encontraron libros en el catálogo.</p>
          )}
        </div>
      )}

      {tab === 'external' && (
        <div>
          <form onSubmit={handleExternalSearch} style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: '600px', marginBottom: 'var(--space-6)' }}>
            <input
              type="text"
              value={externalQuery}
              onChange={(e) => setExternalQuery(e.target.value)}
              placeholder="Buscar título, autor o ISBN en Google..."
              required
              style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <button type="submit" disabled={externalLoading} className="navbar__btn navbar__btn--primary">
              {externalLoading ? 'Buscando...' : 'Buscar Externo'}
            </button>
          </form>

          {externalResults.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {externalResults.map(book => {
                const vol = book.volumeInfo;
                const cover = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail;
                
                return (
                  <div key={book.id} style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ height: '200px', background: 'var(--color-bg-alt)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {cover ? (
                        <img src={cover.replace('http://', 'https://')} alt={vol.title} style={{ height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '2rem' }}>📚</span>
                      )}
                    </div>
                    <div style={{ padding: 'var(--space-3)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', margin: '0 0 var(--space-1) 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vol.title}</h4>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{vol.authors?.join(', ') || 'Sin autor'}</p>
                      
                      <button 
                        onClick={() => setSelectedExternalBook(book)}
                        style={{ marginTop: 'auto', padding: 'var(--space-2)', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        Añadir a SARA
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {externalResults.length === 0 && !externalLoading && externalQuery && (
            <p style={{ color: 'var(--color-text-secondary)' }}>No se encontraron resultados en Google Books.</p>
          )}
        </div>
      )}

      {selectedExternalBook && (
        <AddResourceModal
          googleBook={selectedExternalBook}
          onClose={() => setSelectedExternalBook(null)}
          onSuccess={() => {
            setSelectedExternalBook(null);
            setTab('internal');
            fetchInternalBooks(externalQuery);
          }}
        />
      )}

      {selectedInternalBook && (
        <ManageCopiesModal
          resource={selectedInternalBook}
          onClose={() => {
            setSelectedInternalBook(null);
            fetchInternalBooks(internalQuery);
          }}
        />
      )}
    </div>
  );
}
