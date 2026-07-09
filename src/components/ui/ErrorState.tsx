import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Une erreur est survenue',
  description = 'Impossible de charger les données. Vérifiez votre connexion et réessayez.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-danger-light flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-danger" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </Button>
      )}
    </motion.div>
  )
}
