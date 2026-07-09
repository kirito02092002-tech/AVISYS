import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

interface PasswordInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  className?: string
}

export function PasswordInput({
  label = 'Mot de passe',
  value,
  onChange,
  error,
  placeholder,
  required,
  className,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text">{label}</label>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={clsx(
            'w-full px-3 py-2.5 pr-10 text-sm border border-gray-200/80 rounded-xl bg-white/90',
            'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all',
            error && 'border-danger',
            className,
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
