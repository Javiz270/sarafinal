/**
 * AddResourceModal — Allows staff to add a book to the internal catalog from Google Books data.
 */

import { useState } from 'react';
import { api } from '../../../../lib/api';
import type { GoogleBookItem } from '../../types';

interface AddResourceModalProps {
  googleBook?: GoogleBookItem; // null if adding manually, though currently we rely on GB
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddResourceModal({ googleBook, onClose, onSuccess }: AddResourceModalProps) {
  const vol: any = googleBook?.volumeInfo || {};
  
  // Extract published year
  let year = '';
  if (vol.publishedDate) {
    const y = parseInt(vol.publishedDate.split('-')[0]);
    if (!isNaN(y)) year = y.toString();
  }

  // Extract ISBN
  let isbn = '';
  if (vol.industryIdentifiers) {
    for (const idf of vol.industryIdentifiers) {
      if (idf.type === 'ISBN_13') {
        isbn = idf.identifier;
        break;
      } else if (idf.type === 'ISBN_10' && !isbn) {
        isbn = idf.identifier;
      }
    }
  }

  // Use https for cover
  let coverUrl = '';
  const thumbnail = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail;
  if (thumbnail) {
    coverUrl = thumbnail.replace('http://', 'https://');
  }

  const [formData, setFormData] = useState({
    title: vol.title || '',
    author: vol.authors ? vol.authors.join(', ') : '',
    isbn: isbn,
    description: vol.description || '',
    publisher: vol.publisher || '',
    published_year: year,
    cover_url: coverUrl,
    google_books_id: googleBook?.id || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        published_year: formData.published_year ? parseInt(formData.published_year) : null,
      };
      
      await api.post('/api/resources/', payload);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al agregar el recurso al catálogo.');
      setLoading(false);
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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} className="animate-fade-in">
        
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>Confirmar Datos del Libro</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && <div style={{ color: 'var(--color-error)', padding: 'var(--space-3)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Título *</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Autor(es)</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>ISBN</label>
              <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Editorial</label>
              <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Año de Pub.</label>
              <input type="number" name="published_year" value={formData.published_year} onChange={handleChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>URL Portada</label>
            <input type="url" name="cover_url" value={formData.cover_url} onChange={handleChange} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
          </div>

          <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button type="button" onClick={onClose} style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'var(--font-weight-medium)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="navbar__btn navbar__btn--primary">
              {loading ? 'Guardando...' : 'Agregar al Catálogo SARA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
