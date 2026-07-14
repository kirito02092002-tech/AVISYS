import { Users, UserCheck, Award, AlertTriangle, TrendingUp, XCircle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { PendingUsersPanel } from '@/components/users/PendingUsersPanel'
import { useCollection } from '@/hooks/useCollection'
import { filterUsersForViewer } from '@/lib/permissions'
import type { AppUser, Certification, Progress } from '@/types'
import { computeCertStatus } from '@/lib/utils'

const PIE_COLORS = ['#1E9E6B', '#E0A427', '#D9534F']

export default function RhDashboardPage() {
  const { data: users } = useCollection<AppUser & { id: string }>('users', [])
  const { data: certs } = useCollection<Certification>('certifications', [])
  const { data: progressList } = useCollection<Progress>('progress', [])

  const techniciens = users.filter((u) => u.role === 'technicien')
  const activeTechs = techniciens.filter((u) => u.status === 'active')

  const certsWithStatus = certs.map((c) => ({
    ...c,
    status: computeCertStatus(c.expiryDate),
  }))
  const valide = certsWithStatus.filter((c) => c.status === 'valide').length
  const aRenouveler = certsWithStatus.filter((c) => c.status === 'a_renouveler').length
  const expiree = certsWithStatus.filter((c) => c.status === 'expiree').length

  const avgProgress =
    progressList.length > 0
      ? Math.round(progressList.reduce((a, p) => a + p.percentage, 0) / progressList.length)
      : 0

  const pieData = [
    { name: 'Valide', value: valide || 1 },
    { name: 'À renouveler', value: aRenouveler },
    { name: 'Expirée', value: expiree },
  ]

  const deptMap = new Map<string, { total: number; valide: number }>()
  techniciens.forEach((t) => {
    const dept = t.department || 'Non assigné'
    const entry = deptMap.get(dept) ?? { total: 0, valide: 0 }
    entry.total++
    const userCerts = certsWithStatus.filter((c) => c.uid === (t.uid ?? t.id))
    if (userCerts.every((c) => c.status === 'valide') || userCerts.length === 0) entry.valide++
    deptMap.set(dept, entry)
  })

  const barData = Array.from(deptMap.entries()).map(([dept, { total, valide: v }]) => ({
    department: dept.slice(0, 12),
    compliance: total > 0 ? Math.round((v / total) * 100) : 0,
  }))

  return (
    <>
      <Header title="Tableau de bord RH" subtitle="KPIs et conformité" />
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard icon={Users} value={techniciens.length} label="Total techniciens" />
          <StatCard icon={UserCheck} value={activeTechs.length} label="Techniciens actifs" variant="success" />
          <StatCard icon={Award} value={certs.length} label="Certifications délivrées" />
          <StatCard icon={XCircle} value={expiree} label="Certifications expirées" variant="danger" />
          <StatCard icon={AlertTriangle} value={aRenouveler} label="À renouveler" variant="warning" />
          <StatCard icon={TrendingUp} value={`${avgProgress}%`} label="Progression moyenne" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingUsersPanel users={filterUsersForViewer('rh', users)} />

          <Card>
            <h3 className="font-semibold mb-4">Statuts des certifications</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Valide</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> À renouveler</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger" /> Expirée</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold mb-4">Conformité par département</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} barSize={32} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5edf5" />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 11, fill: '#516072', fontFamily: 'Inter, system-ui, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#516072', fontFamily: 'Inter, system-ui, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 8px 28px rgba(15, 42, 74, 0.12)',
                      fontSize: 12,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  />
                  <Bar dataKey="compliance" fill="#2E9CDB" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">Aucune donnée disponible.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
