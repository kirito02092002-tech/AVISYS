import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Edit, BarChart3, HelpCircle } from 'lucide-react'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCollection } from '@/hooks/useCollection'
import type { Training, Category, Progress, AppUser } from '@/types'
import { CATEGORY_TYPE_LABELS } from '@/types'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export default function FormateurTrainingsPage() {
  const { profile } = useAuth()
  const { success, warning } = useToast()
  const { data: trainings } = useCollection<Training>('trainings', [])
  const { data: categories } = useCollection<Category>('categories', [])
  const { data: progressList } = useCollection<Progress>('progress', [])
  const [modal, setModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    duration: 60,
  })

  const myTrainings = trainings.filter((t) => t.createdBy === profile?.uid)

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—'
  const getAvgProgress = (trainingId: string) => {
    const tp = progressList.filter((p) => p.trainingId === trainingId)
    return tp.length ? Math.round(tp.reduce((a, p) => a + p.percentage, 0) / tp.length) : 0
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      // Query active technicians directly to avoid race condition with users collection
      const snap = await getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'technicien'),
        where('status', '==', 'active'),
      ))
      const activeTechniciens = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser & { id: string })

      if (activeTechniciens.length === 0) {
        warning('Aucun technicien actif trouvé. La formation sera créée sans assignation.')
      }

      await addDoc(collection(db, 'trainings'), {
        ...form,
        duration: Number(form.duration),
        prerequisites: [],
        assignedTo: activeTechniciens.map((u) => u.uid ?? u.id),
        createdBy: profile!.uid,
        published: false,
      })
      success('Formation créée et assignée aux techniciens actifs')
      setModal(false)
      setForm({ title: '', description: '', categoryId: '', duration: 60 })
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Header title="Formations" subtitle="Gestion du catalogue" />
      <div className="p-4 md:p-8">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Nouvelle formation</Button>
        </div>

        {myTrainings.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aucune formation"
            description="Créez votre première formation pour commencer."
            actionLabel="Créer une formation"
            onAction={() => setModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myTrainings.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId)
              return (
                <Card key={t.id}>
                  <span className="text-xs font-medium text-accent">
                    {cat ? CATEGORY_TYPE_LABELS[cat.type] : getCategoryName(t.categoryId)}
                  </span>
                  <h3 className="font-semibold mt-1">{t.title}</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">{t.description}</p>
                  <p className="text-xs text-text-muted mt-2">{t.duration} min · {t.assignedTo?.length ?? 0} techniciens</p>
                  <ProgressBar value={getAvgProgress(t.id)} className="mt-3" />
                  <div className="flex gap-2 mt-4">
                    <Link to={`/formateur/trainings/${t.id}/edit`}>
                      <Button size="sm" variant="secondary"><Edit className="w-3 h-3" /> Éditer</Button>
                    </Link>
                    <Link to={`/formateur/trainings/${t.id}/quiz`}>
                      <Button size="sm" variant="secondary"><HelpCircle className="w-3 h-3" /> Quiz</Button>
                    </Link>
                    <Link to={`/formateur/trainings/${t.id}/progress`}>
                      <Button size="sm" variant="secondary"><BarChart3 className="w-3 h-3" /></Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold">Nouvelle formation</h3>
            <Input label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select
              label="Catégorie"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <Input label="Durée (minutes)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
              <Button onClick={handleCreate} loading={creating} loadingLabel="Création...">Créer</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
