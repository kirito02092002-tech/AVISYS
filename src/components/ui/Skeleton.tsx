import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200 rounded-lg',
        className,
      )}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <Skeleton className="w-11 h-11 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
