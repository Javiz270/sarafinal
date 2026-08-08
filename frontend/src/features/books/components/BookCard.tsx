/**
 * BookCard — Reusable component to display a book in the catalog.
 */

import type { ResourceResponse } from '../types';

interface BookCardProps {
  book: ResourceResponse;
  onClick?: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const isAvailable = book.copies_available > 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="hover:shadow-md"
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ height: '240px', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={`Portada de ${book.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}>📚</span>
        )}
      </div>

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)', margin: '0 0 var(--space-1) 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {book.title}
        </h3>
        {book.author && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            {book.author}
          </p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-full)',
            background: isAvailable ? 'var(--color-success-light)' : 'var(--color-error-light)',
            color: isAvailable ? 'var(--color-success)' : 'var(--color-error)'
          }}>
            {isAvailable ? 'Disponible' : 'No Disponible'}
          </span>
          
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            {book.copies_available} / {book.copies_total} ej.
          </span>
        </div>
      </div>
    </div>
  );
}
