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
  ClipboardList,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

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
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg tracking-tight">AVISYS</p>
            <p className="text-xs text-white/60">Formations aéronautiques</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          <User className="w-5 h-5" />
          Mon profil
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
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

      <aside className="hidden lg:flex w-60 bg-gradient-to-b from-primary via-primary to-primary-dark flex-col h-screen fixed left-0 top-0 z-30 shadow-xl shadow-primary/20">
        {navContent}
      </aside>
    </>
  )
}
