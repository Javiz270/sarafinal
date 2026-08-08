/**
 * Button component — reusable button with variants, sizes, and loading state.
 * Skeleton — will be fully implemented in Phase 3.
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner animate-spin" aria-hidden="true" />}
      {icon && !loading && <span className="btn__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
