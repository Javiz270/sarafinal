/**
 * StatCard component — metric display card for dashboards.
 * Skeleton — will be fully styled in Phase 4.
 */

import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <article className="stat-card">
      {icon && <div className="stat-card__icon">{icon}</div>}
      <div className="stat-card__content">
        <p className="stat-card__title">{title}</p>
        <p className="stat-card__value">{value}</p>
        {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
      </div>
    </article>
  );
}
