/**
 * BookDetailModal — Displays full details for a book.
 */

import type { ResourceResponse } from '../types';

interface BookDetailModalProps {
  book: ResourceResponse;
  onClose: () => void;
}

export default function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const isAvailable = book.copies_available > 0;

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
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }} className="animate-fade-in">
        
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--color-border)' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
             {book.cover_url ? (
                <img src={book.cover_url} alt={`Portada de ${book.title}`} style={{ width: '100%', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '2/3', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '4rem' }}>📚</span>
                </div>
              )}
          </div>
          
          <div style={{ flex: '2 1 300px' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
              {book.title}
            </h2>
            {book.author && (
              <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                {book.author}
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <span style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                background: isAvailable ? 'var(--color-success-light)' : 'var(--color-error-light)',
                color: isAvailable ? 'var(--color-success)' : 'var(--color-error)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {isAvailable ? 'Disponible' : 'No Disponible'}
              </span>
              <span style={{ padding: 'var(--space-1) 0', fontSize: 'var(--font-size-sm)' }}>
                {book.copies_available} de {book.copies_total} ejemplares
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
              {book.isbn && (
                <div>
                  <strong style={{ display: 'block', color: 'var(--color-text-secondary)' }}>ISBN</strong>
                  {book.isbn}
                </div>
              )}
              {book.publisher && (
                <div>
                  <strong style={{ display: 'block', color: 'var(--color-text-secondary)' }}>Editorial</strong>
                  {book.publisher}
                </div>
              )}
              {book.published_year && (
                <div>
                  <strong style={{ display: 'block', color: 'var(--color-text-secondary)' }}>Año de Publicación</strong>
                  {book.published_year}
                </div>
              )}
            </div>

            {book.description && (
              <div>
                <strong style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Descripción</strong>
                <p style={{ lineHeight: 1.6, fontSize: 'var(--font-size-sm)' }}>{book.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
