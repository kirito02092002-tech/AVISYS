import { Link } from 'react-router-dom'
import { GraduationCap, Lock } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { useCollection } from '@/hooks/useCollection'
import type { Training, Progress, Category } from '@/types'
import { CATEGORY_TYPE_LABELS } from '@/types'
import { where } from 'firebase/firestore'
import { useState } from 'react'

export default function TechnicienTrainingsPage() {
  const { profile } = useAuth()
  const { data: trainings } = useCollection<Training>('trainings', [])
  const { data: progressList } = useCollection<Progress>('progress', [
    where('uid', '==', profile?.uid ?? ''),
  ])
  const { data: categories } = useCollection<Category>('categories', [])
  const [filter, setFilter] = useState<'all' | 'todo' | 'progress' | 'done'>('all')

  const myTrainings = trainings.filter((t) => t.assignedTo?.includes(profile?.uid ?? ''))

  const getProgress = (id: string) => progressList.find((p) => p.trainingId === id)?.percentage ?? 0

  const filtered = myTrainings.filter((t) => {
    const p = getProgress(t.id)
    if (filter === 'todo') return p === 0
    if (filter === 'progress') return p > 0 && p < 100
    if (filter === 'done') return p === 100
    return true
  })

  return (
    <>
      <Header title="Mes formations" subtitle="Catalogue assigné" />
      <div className="p-4 md:p-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'todo', 'progress', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'todo' ? 'À faire' : f === 'progress' ? 'En cours' : 'Terminées'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Aucune formation"
            description="Aucune formation ne correspond à ce filtre."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId)
              const progress = getProgress(t.id)
              const locked = t.prerequisites.length > 0 && progress === 0

              return (
                <Card key={t.id} className="relative">
                  {locked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-accent">
                    {cat ? CATEGORY_TYPE_LABELS[cat.type] : 'Formation'}
                  </span>
                  <h3 className="font-semibold mt-1">{t.title}</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">{t.description}</p>
                  {progress > 0 && <ProgressBar value={progress} className="mt-3" />}
                  <Link to={`/trainings/${t.id}`} className="inline-block mt-4">
                    <span className="text-sm text-accent font-medium hover:underline">
                      {progress > 0 ? 'Continuer' : 'Commencer'} →
                    </span>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
