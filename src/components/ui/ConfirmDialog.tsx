import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  onConfirm,
  onCancel,
  loading,
  danger,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-surface rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          {danger && (
            <div className="p-2 rounded-full bg-danger-light">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text">{title}</h3>
            <p className="text-sm text-text-muted mt-2">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
