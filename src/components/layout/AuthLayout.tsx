import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import aerodeskLogo from '@/assets/aerodesk-logo.svg'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary-dark/90 to-[#061525]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(46,156,219,0.25)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(30,158,107,0.15)_0%,_transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 ring-1 ring-white/15 shadow-lg shadow-accent/20 mb-4 backdrop-blur-sm"
          >
            <img src={aerodeskLogo} alt="AeroDesk" className="w-12 h-12 object-contain" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">AeroDesk</h1>
          <p className="text-white/80 text-[11px] uppercase tracking-[0.32em] font-semibold mt-2">Système d'information aéronautique</p>
          <p className="text-white/70 text-sm mt-3">{subtitle}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl shadow-black/20 border border-white/20 p-8">
          <h2 className="text-xl font-semibold text-text mb-6">{title}</h2>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
