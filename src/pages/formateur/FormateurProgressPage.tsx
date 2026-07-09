import { useParams } from 'react-router-dom'
import { where } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useCollection } from '@/hooks/useCollection'
import type { Progress, AppUser, QuizAttempt } from '@/types'
import { formatRelativeDate } from '@/lib/utils'

export default function FormateurProgressPage() {
  const { id: trainingId } = useParams<{ id: string }>()
  const { data: progressList } = useCollection<Progress>('progress', [
    where('trainingId', '==', trainingId ?? ''),
  ])
  const { data: users } = useCollection<AppUser & { id: string }>('users', [])
  const { data: attempts } = useCollection<QuizAttempt>('quizAttempts', [
    where('trainingId', '==', trainingId ?? ''),
  ])

  const sorted = [...progressList].sort((a, b) => a.percentage - b.percentage)

  const getUserName = (uid: string) =>
    users.find((u) => (u.uid ?? u.id) === uid)?.fullName ?? uid

  const getQuizStatus = (uid: string) => {
    const userAttempts = attempts.filter((a) => a.uid === uid)
    if (userAttempts.length === 0) return 'non_tente'
    const last = userAttempts[userAttempts.length - 1]
    return last.passed ? 'reussi' : 'echoue'
  }

  return (
    <>
      <Header title="Progression" subtitle="Suivi par technicien" />
      <div className="p-4 md:p-8">
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-text-muted">
                <th className="px-4 py-3">Technicien</th>
                <th className="px-4 py-3">Progression</th>
                <th className="px-4 py-3">Quiz</th>
                <th className="px-4 py-3">Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const quizStatus = getQuizStatus(p.uid)
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{getUserName(p.uid)}</td>
                    <td className="px-4 py-3 w-48">
                      <ProgressBar value={p.percentage} showLabel />
                    </td>
                    <td className="px-4 py-3">
                      {quizStatus === 'reussi' && <StatusBadge status="valide" label="Réussi" />}
                      {quizStatus === 'echoue' && <StatusBadge status="expiree" label="Échoué" />}
                      {quizStatus === 'non_tente' && <StatusBadge status="pending" label="Non tenté" />}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{formatRelativeDate(p.lastAccessed)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <p className="p-6 text-sm text-text-muted">Aucune progression enregistrée.</p>
          )}
        </Card>
      </div>
    </>
  )
}
