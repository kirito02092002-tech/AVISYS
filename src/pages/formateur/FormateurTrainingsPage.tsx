import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Edit3, BarChart2, HelpCircle, Clock, Users } from 'lucide-react'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCollection } from '@/hooks/useCollection'
import type { Training, Category, Progress, AppUser } from '@/types'
import { CATEGORY_TYPE_LABELS } from '@/types'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

const CATEGORY_ACCENT: Record<string, string> = {
  reglementaire: 'from-warning to-orange-400',
  technique: 'from-accent to-blue-400',
  qualite: 'from-success to-emerald-400',
  interne: 'from-purple-500 to-violet-400',
}

const CATEGORY_BG: Record<string, string> = {
  reglementaire: 'bg-warning/10 text-warning',
  technique: 'bg-accent/10 text-accent',
  qualite: 'bg-success/10 text-success',
  interne: 'bg-purple-500/10 text-purple-600',
}

export default function FormateurTrainingsPage() {
  const { profile } = useAuth()
  const { success, warning } = useToast()
  const { data: trainings } = useCollection<Training>('trainings', [])
  const { data: categories } = useCollection<Category>('categories', [])
  const { data: progressList } = useCollection<Progress>('progress', [])
  const [modal, setModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', duration: 60 })

  const myTrainings = trainings.filter((t) => t.createdBy === profile?.uid)

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—'

  const getAvgProgress = (trainingId: string) => {
    const tp = progressList.filter((p) => p.trainingId === trainingId)
    return tp.length ? Math.round(tp.reduce((a, p) => a + p.percentage, 0) / tp.length) : 0
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
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
        <div className="flex justify-end mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {myTrainings.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId)
              const catType = cat?.type ?? 'technique'
              const avg = getAvgProgress(t.id)

              return (
                <div
                  key={t.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${CATEGORY_ACCENT[catType] ?? CATEGORY_ACCENT.technique}`} />
                  <div className="p-5">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_BG[catType] ?? CATEGORY_BG.technique}`}>
                      {cat ? CATEGORY_TYPE_LABELS[cat.type] : getCategoryName(t.categoryId)}
                    </span>
                    <h3 className="font-bold text-base text-text mt-2 mb-1 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {t.title}
                    </h3>
                    <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed">{t.description}</p>
                    <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t.duration} min</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{t.assignedTo?.length ?? 0} technicien(s)</span>
                    </div>
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-text-muted">Progression moyenne</span>
                        <span className="text-xs font-bold text-text">{avg}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_ACCENT[catType] ?? CATEGORY_ACCENT.technique} transition-all duration-500`}
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/formateur/trainings/${t.id}/edit`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all">
                          <Edit3 className="w-3.5 h-3.5" />Éditer
                        </button>
                      </Link>
                      <Link to={`/formateur/trainings/${t.id}/quiz`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white transition-all">
                          <HelpCircle className="w-3.5 h-3.5" />Quiz
                        </button>
                      </Link>
                      <Link to={`/formateur/trainings/${t.id}/progress`}>
                        <button className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-success/10 text-success hover:bg-success hover:text-white transition-all" title="Progression">
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg">Nouvelle formation</h3>
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
