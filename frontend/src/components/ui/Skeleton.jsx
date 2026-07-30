import { cn } from '../../lib/utils';

export const Skeleton = ({ className }) => (
  <div className={cn('skeleton rounded-[var(--radius-md)]', className)} aria-hidden="true" />
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" style={{ opacity: 1 - i * 0.08 }} />
    ))}
    <span className="sr-only">Loading table data</span>
  </div>
);

export const SkeletonKpiGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-28 w-full rounded-[var(--radius-lg)]" />
    ))}
  </div>
);
