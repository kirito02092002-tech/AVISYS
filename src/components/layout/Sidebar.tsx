import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  ScrollText,
  BookOpen,
  FolderOpen,
  GraduationCap,
  Calendar,
  MessageSquare,
  Shield,
  FileBarChart,
  Award,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'
import aerodeskLogo from '@/assets/aerodesk-logo.svg'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Utilisateurs', icon: Users },
    { to: '/admin/audit-log', label: 'Journal d\'audit', icon: ScrollText },
    { to: '/admin/settings', label: 'Paramètres', icon: Settings },
  ],
  rh: [
    { to: '/rh/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/rh/users', label: 'Utilisateurs', icon: Users },
    { to: '/rh/compliance', label: 'Conformité', icon: Shield },
    { to: '/rh/certifications', label: 'Certifications', icon: Award },
    { to: '/rh/reports', label: 'Rapports', icon: FileBarChart },
  ],
  formateur: [
    { to: '/formateur/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/formateur/categories', label: 'Catégories', icon: FolderOpen },
    { to: '/formateur/trainings', label: 'Formations', icon: BookOpen },
    { to: '/formateur/meetings', label: 'Réunions', icon: Calendar },
    { to: '/formateur/forum', label: 'Forum', icon: MessageSquare },
  ],
  technicien: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/trainings', label: 'Mes formations', icon: GraduationCap },
    { to: '/certifications', label: 'Certifications', icon: Award },
    { to: '/forum', label: 'Forum', icon: MessageSquare },
    { to: '/meetings', label: 'Réunions', icon: Calendar },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
}

export function Sidebar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!profile) return null
  const items = NAV_BY_ROLE[profile.role]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navContent = (
    <>
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/20">
            <img src={aerodeskLogo} alt="AeroDesk" className="w-10 h-10 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-white text-base tracking-tight">AeroDesk</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/65 font-semibold">Système d'information aéronautique</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group',
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/8 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full shadow-sm shadow-accent/50" />
                )}
                <Icon className={clsx('w-4.5 h-4.5 shrink-0 transition-transform', !isActive && 'group-hover:scale-110')} />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/8 hover:text-white transition-all group"
        >
          <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Mon profil
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-danger/20 hover:text-danger transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-primary rounded-lg text-white"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-primary flex flex-col h-full">
            <button
              className="absolute top-4 right-4 text-white/70"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex w-60 bg-gradient-to-b from-[#0a1f38] via-primary to-[#0d2545] flex-col h-screen fixed left-0 top-0 z-30 shadow-2xl shadow-primary/30">
        {navContent}
      </aside>
    </>
  )
}
