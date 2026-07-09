import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  trend?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatCard({ icon: Icon, value, label, trend, variant = 'default' }: StatCardProps) {
  const iconColors = {
    default: 'bg-accent-light text-accent',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger: 'bg-danger-light text-danger',
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm shadow-primary/5 border border-gray-100/80 hover:shadow-md hover:shadow-primary/5 transition-shadow duration-300 p-5 md:p-6 flex items-start gap-4">
      <div className={clsx('p-3 rounded-lg', iconColors[variant])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-semibold text-text">{value}</p>
        <p className="text-sm text-text-muted mt-0.5">{label}</p>
        {trend && <p className="text-xs text-success mt-1">{trend}</p>}
      </div>
    </div>
  )
}
