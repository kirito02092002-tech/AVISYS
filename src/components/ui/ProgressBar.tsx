import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className, showLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const color =
    clamped >= 75 ? 'bg-success' : clamped >= 40 ? 'bg-warning' : 'bg-danger'

  return (
    <div className={clsx('w-full', className)}>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-text-muted mt-1">{clamped}%</p>
      )}
    </div>
  )
}
