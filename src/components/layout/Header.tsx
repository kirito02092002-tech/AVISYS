import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUnreadCount } from '@/hooks/useCollection'
import aerodeskLogo from '@/assets/aerodesk-logo.svg'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { profile } = useAuth()
  const unread = useUnreadCount(profile?.uid)

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-100/80 px-4 md:px-8 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <div className="hidden sm:flex w-12 h-12 rounded-2xl border border-primary/10 bg-white shadow-lg shadow-primary/10 items-center justify-center overflow-hidden">
          <img src={aerodeskLogo} alt="AeroDesk" className="w-9 h-9 object-contain" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative p-2.5 rounded-xl hover:bg-accent/10 hover:scale-105 active:scale-95 transition-all group"
        >
          <Bell className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm shadow-danger/50">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-md">
            {profile?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text">{profile?.fullName}</p>
            <p className="text-xs text-text-muted capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
