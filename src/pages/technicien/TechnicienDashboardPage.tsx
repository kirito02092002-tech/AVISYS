import { Link } from 'react-router-dom'
import { AlertTriangle, BookOpen, Bell } from 'lucide-react'
import { where } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuth } from '@/context/AuthContext'
import { useCollection } from '@/hooks/useCollection'
import type { Training, Progress, Certification, Notification } from '@/types'
import { computeCertStatus, formatRelativeDate } from '@/lib/utils'

export default function TechnicienDashboardPage() {
  const { profile } = useAuth()
  const { data: trainings } = useCollection<Training>('trainings', [])
  const { data: progressList } = useCollection<Progress>('progress', [
    where('uid', '==', profile?.uid ?? ''),
  ])
  const { data: certs } = useCollection<Certification>('certifications', [
    where('uid', '==', profile?.uid ?? ''),
  ])
  const { data: notifications } = useCollection<Notification>('notifications', [
    where('uid', '==', profile?.uid ?? ''),
  ])

  const myTrainings = trainings.filter((t) => t.assignedTo?.includes(profile?.uid ?? ''))
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Technicien'

  const urgentCerts = certs.filter((c) => {
    const s = computeCertStatus(c.expiryDate)
    return s === 'a_renouveler' || s === 'expiree'
  })

  const inProgress = myTrainings.filter((t) => {
    const p = progressList.find((pr) => pr.trainingId === t.id)
    return p && p.percentage > 0 && p.percentage < 100
  })

  const notStarted = myTrainings.filter((t) => {
    const p = progressList.find((pr) => pr.trainingId === t.id)
    return !p || p.percentage === 0
  })

  const getProgress = (trainingId: string) =>
    progressList.find((p) => p.trainingId === trainingId)?.percentage ?? 0

  const recentNotifs = notifications.slice(0, 5)

  return (
    <>
      <Header title={`Bonjour, ${firstName}`} subtitle="Votre espace de formation" />
      <div className="p-4 md:p-8 space-y-6">
        {urgentCerts.length > 0 && (
          <div className="bg-warning-light border border-warning/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <p className="text-sm font-medium">
                {urgentCerts.length} certification(s) nécessitent votre attention
              </p>
            </div>
            <Link to="/certifications">
              <Button size="sm">Voir mes certifications</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" /> Formations en cours
              </h2>
              {inProgress.length === 0 ? (
                <Card><p className="text-sm text-text-muted">Aucune formation en cours.</p></Card>
              ) : (
                <div className="grid gap-4">
                  {inProgress.map((t) => (
                    <Card key={t.id} className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{t.title}</h3>
                        <ProgressBar value={getProgress(t.id)} className="mt-2" showLabel />
                      </div>
                      <Link to={`/trainings/${t.id}`}>
                        <Button size="sm">Continuer</Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-semibold mb-4">Formations à commencer</h2>
              {notStarted.length === 0 ? (
                <Card><p className="text-sm text-text-muted">Toutes vos formations sont commencées ou terminées.</p></Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {notStarted.map((t) => (
                    <Card key={t.id}>
                      <h3 className="font-medium">{t.title}</h3>
                      <p className="text-xs text-text-muted mt-1">{t.duration} min</p>
                      <Link to={`/trainings/${t.id}`} className="inline-block mt-3">
                        <Button size="sm" variant="secondary">Démarrer</Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" /> Notifications récentes
            </h3>
            <div className="space-y-3">
              {recentNotifs.map((n) => (
                <div key={n.id} className="text-sm border-b border-gray-50 pb-2">
                  <p className={n.read ? 'text-text-muted' : 'font-medium'}>{n.message}</p>
                  <p className="text-xs text-text-muted">{formatRelativeDate(n.createdAt)}</p>
                </div>
              ))}
              {recentNotifs.length === 0 && (
                <p className="text-sm text-text-muted">Aucune notification.</p>
              )}
            </div>
            <Link to="/notifications" className="block text-sm text-accent mt-4 hover:underline">
              Voir tout
            </Link>
          </Card>
        </div>
      </div>
    </>
  )
}
