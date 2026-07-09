import { BookOpen, Users, TrendingUp, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
    return { name: t.title.slice(0, 20), progress: avg }
  })

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
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#2E9CDB" radius={[0, 4, 4, 0]} />
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
