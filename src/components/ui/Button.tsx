import { clsx } from 'clsx'
import { Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingLabel?: string
  success?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  loadingLabel,
  success,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isBusy = loading || success

  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-[0.98]',
        {
          'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5': variant === 'primary',
          'border border-gray-200/80 bg-white hover:bg-gray-50 text-text shadow-sm': variant === 'secondary',
          'bg-gradient-to-r from-danger to-red-600 text-white hover:opacity-90': variant === 'danger',
          'bg-transparent hover:bg-gray-100 text-text': variant === 'ghost',
          'px-3 py-1.5 text-sm rounded-xl': size === 'sm',
          'px-4 py-2.5 text-sm rounded-xl': size === 'md',
          'px-6 py-3 text-base rounded-xl': size === 'lg',
        },
        className,
      )}
      disabled={disabled || isBusy}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {success && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <Check className="w-4 h-4" />
        </motion.span>
      )}
      <span className={clsx(isBusy && 'opacity-90')}>
        {loading && loadingLabel ? loadingLabel : children}
      </span>
    </button>
  )
}
