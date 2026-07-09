import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
  onClick?: () => void
}

export function Card({ children, className, padding = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-surface rounded-2xl shadow-sm shadow-primary/5 border border-gray-100/80',
        'hover:shadow-md transition-shadow duration-300',
        padding && 'p-5 md:p-6',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
