/**
 * PageWrapper component — wraps page content with consistent padding and animation.
 */

import type { ReactNode } from 'react';

interface PageWrapperProps {
  title?: string;
  children: ReactNode;
}

export default function PageWrapper({ title, children }: PageWrapperProps) {
  return (
    <section className="page-wrapper animate-fade-in-up">
      {title && <h1 className="page-wrapper__title">{title}</h1>}
      {children}
    </section>
  );
}
