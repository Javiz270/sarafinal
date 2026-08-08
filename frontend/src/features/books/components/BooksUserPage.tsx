/**
 * BooksUserPage — Catalog browsing view for regular users.
 */

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { ResourceResponse } from '../types';
import BookCard from './BookCard';
import BookDetailModal from './BookDetailModal';

export default function BooksUserPage() {
  const [books, setBooks] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<ResourceResponse | null>(null);

  const fetchBooks = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.get<ResourceResponse[]>(`/api/resources/?q=${encodeURIComponent(query)}`);
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchQuery);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Catálogo Bibliográfico
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Explora los recursos disponibles en el Learning Commons.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: '600px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, autor o ISBN..."
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-md)'
            }}
          />
          <button type="submit" className="navbar__btn navbar__btn--primary">
            Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse" style={{ height: '350px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {books.map(book => (
            <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>No se encontraron libros que coincidan con tu búsqueda.</p>
        </div>
      )}

      {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}
