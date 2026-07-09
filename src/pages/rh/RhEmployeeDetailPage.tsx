import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { where } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/PageLoader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { db } from '@/lib/firebase'
import type { AppUser, Certification, Progress, Training } from '@/types'
import { useCollection } from '@/hooks/useCollection'
import { computeCertStatus, formatDate } from '@/lib/utils'
import { Award, BookOpen } from 'lucide-react'

export default function RhEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<AppUser | null>(null)
  const { data: certs } = useCollection<Certification>('certifications', [
    where('uid', '==', id ?? ''),
  ])
  const { data: progressList } = useCollection<Progress>('progress', [
    where('uid', '==', id ?? ''),
  ])
  const { data: trainings } = useCollection<Training>('trainings', [])

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'users', id)).then((snap) => {
      if (snap.exists()) setUser({ uid: snap.id, ...snap.data() } as AppUser)
    })
  }, [id])

  if (!user) {
    return <><Header title="Historique technicien" /><PageLoader title="Chargement de l'employé" /></>
  }

  const timeline = progressList.map((p) => {
    const training = trainings.find((t) => t.id === p.trainingId)
    const cert = certs.find((c) => c.trainingId === p.trainingId)
    return { progress: p, training, cert }
  })

  return (
    <>
      <Header title={user.fullName} subtitle={`${user.department} · ${user.company}`} />
      <div className="p-4 md:p-8 max-w-3xl space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.fullName}</h2>
              <p className="text-sm text-text-muted">Matricule : {user.employeeId}</p>
              <StatusBadge status={user.status} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Historique de formation
          </h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-text-muted">Aucune formation suivie.</p>
          ) : (
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
              {timeline.map(({ progress, training, cert }) => (
                <div key={progress.id} className="relative">
                  <div className="absolute -left-4 w-3 h-3 rounded-full bg-accent border-2 border-white" />
                  <div className="ml-2">
                    <p className="font-medium">{training?.title ?? 'Formation'}</p>
                    <p className="text-xs text-text-muted">{formatDate(progress.lastAccessed)} · {progress.percentage}% complété</p>
                    {cert && (
                      <div className="mt-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-success" />
                        <StatusBadge status={computeCertStatus(cert.expiryDate)} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
