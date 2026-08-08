/**
 * SearchBar component — search input with icon.
 * Skeleton — will be fully styled in Phase 3.
 */

import { type InputHTMLAttributes } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export default function SearchBar({ onSearch, ...props }: SearchBarProps) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        className="search-bar__input"
        aria-label="Buscar"
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  );
}
