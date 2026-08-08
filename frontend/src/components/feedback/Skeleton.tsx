/**
 * Skeleton component — placeholder for loading content.
 */

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  count?: number;
}

export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  count = 1,
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton animate-shimmer"
          style={{
            width,
            height,
            borderRadius,
            marginBottom: count > 1 ? 'var(--space-2)' : undefined,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
