/**
 * StatCard — Reusable component to display a statistic on the dashboard.
 * Uses a premium glassmorphism design.
 */

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'error';
  description?: string;
}

export default function StatCard({ title, value, icon, color = 'primary', description }: StatCardProps) {
  // Map our semantic colors to CSS variables
  const colorMap = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)',
    error: 'var(--color-error)',
  };

  const bgMap = {
    primary: 'var(--color-primary-light)',
    success: 'var(--color-success-light)',
    warning: 'var(--color-warning-light)',
    info: 'var(--color-info-light)',
    error: 'var(--color-error-light)',
  };

  return (
    <div
      className="stat-card"
      style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
          {title}
        </h3>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-lg)',
            background: bgMap[color],
            color: colorMap[color],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
          }}
        >
          {icon}
        </div>
      </div>
      
      <div>
        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', lineHeight: 1 }}>
          {value}
        </div>
        {description && (
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
