import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface PageLoaderProps {
  title?: string
  subtitle?: string
}

export function PageLoader({ title, subtitle }: PageLoaderProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" />
          <div className="relative w-14 h-14 rounded-full bg-accent-light flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
          </div>
        </div>
        {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
        {!title && !subtitle && <p className="text-sm text-text-muted mt-1">Chargement...</p>}
      </motion.div>
    </div>
  )
}
