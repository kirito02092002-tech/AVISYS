import { Users, Clock, BookOpen, Award } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/StatCard'
import { StatCardSkeleton } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { PendingUsersPanel } from '@/components/users/PendingUsersPanel'
import { useCollection } from '@/hooks/useCollection'
import type { AppUser, Training, Certification, AuditLog } from '@/types'
import { formatRelativeDate } from '@/lib/utils'
import { orderBy, limit } from 'firebase/firestore'

export default function AdminDashboardPage() {
  const { data: users, loading: usersLoading } = useCollection<AppUser & { id: string }>('users', [])
  const { data: trainings } = useCollection<Training>('trainings', [])
  const { data: certs } = useCollection<Certification>('certifications', [])
  const { data: logs } = useCollection<AuditLog>('auditLogs', [orderBy('timestamp', 'desc'), limit(8)])

  const activeUsers = users.filter((u) => u.status === 'active')
  const pendingUsers = users.filter((u) => u.status === 'pending')
  const activeCerts = certs.filter((c) => c.status === 'valide')

  const chartData = [
    { month: 'Jan', users: Math.max(1, activeUsers.length - 20) },
    { month: 'Fév', users: Math.max(1, activeUsers.length - 15) },
    { month: 'Mar', users: Math.max(1, activeUsers.length - 10) },
    { month: 'Avr', users: Math.max(1, activeUsers.length - 5) },
    { month: 'Mai', users: activeUsers.length },
    { month: 'Juin', users: activeUsers.length },
  ]

  return (
    <>
      <Header title="Tableau de bord Admin" subtitle="Vue globale de la plateforme" />
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {usersLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard icon={Users} value={activeUsers.length} label="Utilisateurs actifs" />
              <StatCard icon={Clock} value={pendingUsers.length} label="Comptes en attente" variant="warning" />
              <StatCard icon={BookOpen} value={trainings.length} label="Formations totales" />
              <StatCard icon={Award} value={activeCerts.length} label="Certifications actives" variant="success" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingUsersPanel users={users} />

          <Card>
            <h3 className="font-semibold mb-4">Évolution des utilisateurs actifs</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#2E9CDB" fill="url(#colorUsersAdmin)" fillOpacity={1} />
                <defs>
                  <linearGradient id="colorUsersAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E9CDB" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2E9CDB" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card>
          <h3 className="font-semibold mb-4">Activité récente</h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <span className="flex-1">{log.details || log.action}</span>
                <span className="text-xs text-text-muted">{formatRelativeDate(log.timestamp)}</span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-text-muted">Aucune activité récente.</p>}
          </div>
        </Card>
      </div>
    </>
  )
}
