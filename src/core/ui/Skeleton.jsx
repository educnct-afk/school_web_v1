import clsx from 'clsx';

export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="hidden md:block">
        <div className="grid gap-4 px-4 py-3 bg-ink-100/60 dark:bg-white/5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 w-20" />)}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-4 px-4 py-4 border-t border-ink-100/60 dark:border-white/5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-4 w-full max-w-[200px]" />)}
          </div>
        ))}
      </div>
      <ul className="md:hidden p-3 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="p-4 rounded-xl border border-ink-100/60 dark:border-white/5 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </li>
        ))}
      </ul>
    </div>
  );
}
