/**
 * Card component — container for content sections.
 */

import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <article
      className={`card card--pad-${padding} ${hoverable ? 'card--hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}
