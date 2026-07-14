import { BookOpen, Users, TrendingUp, Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { useCollection } from '@/hooks/useCollection'
import type { Training, Progress, Meeting } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { where, orderBy, limit } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'

export default function FormateurDashboardPage() {
  const { profile } = useAuth()
  const { data: trainings } = useCollection<Training>('trainings', [])
  const { data: progressList } = useCollection<Progress>('progress', [])
  const { data: meetings } = useCollection<Meeting>('meetings', [
    where('createdBy', '==', profile?.uid ?? ''),
    orderBy('date', 'asc'),
    limit(3),
  ])

  const myTrainings = trainings.filter((t) => t.createdBy === profile?.uid)
  const assignedCount = myTrainings.reduce((acc, t) => acc + (t.assignedTo?.length ?? 0), 0)
  const avgProgress =
    progressList.length > 0
      ? Math.round(progressList.reduce((a, p) => a + p.percentage, 0) / progressList.length)
      : 0

  const chartData = myTrainings.map((t) => {
    const tp = progressList.filter((p) => p.trainingId === t.id)
    const avg = tp.length ? Math.round(tp.reduce((a, p) => a + p.percentage, 0) / tp.length) : 0
    return { name: t.title.length > 18 ? t.title.slice(0, 18) + '…' : t.title, progress: avg }
  })

  const COLORS = ['#2E9CDB', '#1e9e6b', '#e0a427', '#7c3aed', '#0f2a4a']

  return (
    <>
      <Header title="Tableau de bord Formateur" subtitle="Suivi des formations" />
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} value={myTrainings.length} label="Formations actives" />
          <StatCard icon={Users} value={assignedCount} label="Techniciens assignés" />
          <StatCard icon={TrendingUp} value={`${avgProgress}%`} label="Taux de complétion moyen" variant="success" />
          <StatCard icon={Calendar} value={meetings.length} label="Prochaines réunions" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold mb-4">Complétion par formation</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} barSize={30} margin={{ top: 10, right: 10, left: 0, bottom: 24 }}>
                  <defs>
                    <linearGradient id="completionBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2E9CDB" />
                      <stop offset="100%" stopColor="#0F2A4A" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5edf5" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#516072', fontFamily: 'Inter, system-ui, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-12}
                    textAnchor="end"
                    interval={0}
                    height={70}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#516072', fontFamily: 'Inter, system-ui, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Progression']}
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 8px 28px rgba(15, 42, 74, 0.12)',
                      fontSize: 12,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    cursor={{ fill: 'rgba(46,156,219,0.08)' }}
                  />
                  <Bar dataKey="progress" radius={[10, 10, 0, 0]} fill="url(#completionBarGradient)">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                    <LabelList dataKey="progress" position="top" formatter={(v: unknown) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#516072', fontFamily: 'Inter, system-ui, sans-serif' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">Aucune formation créée.</p>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Prochaines réunions</h3>
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-text-muted">{formatDateTime(m.date)}</p>
                </div>
              ))}
              {meetings.length === 0 && (
                <p className="text-sm text-text-muted">Aucune réunion planifiée.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
