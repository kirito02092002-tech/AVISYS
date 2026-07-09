import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  doc, getDoc, updateDoc, collection, addDoc, deleteDoc,
  getDocs, query, orderBy,
} from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { FileUploader } from '@/components/ui/FileUploader'
import { db } from '@/lib/firebase'
import { useToast } from '@/context/ToastContext'
import type { Training, Category, Chapter, AppUser } from '@/types'
import { useCollection } from '@/hooks/useCollection'
import { Plus, Trash2, GripVertical, Users } from 'lucide-react'

export default function FormateurTrainingEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: categories } = useCollection<Category>('categories', [])
  const { data: users } = useCollection<AppUser & { id: string }>('users', [])
  const { success, error: toastError } = useToast()
  const [training, setTraining] = useState<Training | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'trainings', id)).then((snap) => {
      if (snap.exists()) setTraining({ id: snap.id, ...snap.data() } as Training)
    })
    getDocs(query(collection(db, 'trainings', id!, 'chapters'), orderBy('order'))).then((snap) => {
      setChapters(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chapter))
    })
  }, [id])

  const saveTraining = async () => {
    if (!id || !training) return
    setSaving(true)
    setSaved(false)
    try {
      const { id: _id, chapters: _c, ...data } = training
      await updateDoc(doc(db, 'trainings', id), data)
      success('Formation enregistrée avec succès')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      toastError('Erreur lors de l\'enregistrement de la formation')
    } finally {
      setSaving(false)
    }
  }

  const addChapter = async () => {
    if (!id) return
    const ref = await addDoc(collection(db, 'trainings', id, 'chapters'), {
      title: `Chapitre ${chapters.length + 1}`,
      order: chapters.length,
      documentUrls: [],
    })
    setChapters([...chapters, { id: ref.id, title: `Chapitre ${chapters.length + 1}`, order: chapters.length, documentUrls: [] }])
    setExpanded(ref.id)
  }

  const updateChapter = async (chapterId: string, data: Partial<Chapter>) => {
    if (!id) return
    await updateDoc(doc(db, 'trainings', id, 'chapters', chapterId), data)
    setChapters(chapters.map((c) => (c.id === chapterId ? { ...c, ...data } : c)))
  }

  const deleteChapter = async (chapterId: string) => {
    if (!id) return
    await deleteDoc(doc(db, 'trainings', id, 'chapters', chapterId))
    setChapters(chapters.filter((c) => c.id !== chapterId))
  }

  const techniciens = users.filter((u) => u.role === 'technicien' && u.status === 'active')

  const toggleAssign = async (uid: string) => {
    if (!training) return
    const assigned = training.assignedTo ?? []
    const newAssigned = assigned.includes(uid)
      ? assigned.filter((u) => u !== uid)
      : [...assigned, uid]
    setTraining({ ...training, assignedTo: newAssigned })
    try {
      await updateDoc(doc(db, 'trainings', training.id), { assignedTo: newAssigned })
      success('Assignation mise à jour')
    } catch {
      toastError('Erreur lors de la mise à jour de l\'assignation')
      setTraining({ ...training, assignedTo: assigned })
    }
  }

  if (!training) {
    return <><Header title="Édition formation" /><PageLoader title="Chargement de la formation" /></>
  }

  return (
    <>
      <Header title={training.title} subtitle="Édition de la formation" />
      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">Informations générales</h3>
          <div className="space-y-4">
            <Input label="Titre" value={training.title} onChange={(e) => setTraining({ ...training, title: e.target.value })} />
            <Textarea label="Description" value={training.description} onChange={(e) => setTraining({ ...training, description: e.target.value })} />
            <Select
              label="Catégorie"
              value={training.categoryId}
              onChange={(e) => setTraining({ ...training, categoryId: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input label="Durée (min)" type="number" value={training.duration} onChange={(e) => setTraining({ ...training, duration: Number(e.target.value) })} />
            <Button
              onClick={saveTraining}
              loading={saving}
              loadingLabel="Enregistrement..."
              success={saved}
            >
              {saved ? 'Enregistré' : 'Enregistrer'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Chapitres</h3>
            <Button size="sm" onClick={addChapter}><Plus className="w-4 h-4" /> Ajouter</Button>
          </div>
          <div className="space-y-2">
            {chapters.map((ch) => (
              <div key={ch.id} className="border border-gray-100 rounded-lg">
                <button
                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50"
                  onClick={() => setExpanded(expanded === ch.id ? null : ch.id)}
                >
                  <GripVertical className="w-4 h-4 text-text-muted" />
                  <span className="flex-1 font-medium text-sm">{ch.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteChapter(ch.id) }}>
                    <Trash2 className="w-4 h-4 text-danger" />
                  </button>
                </button>
                {expanded === ch.id && (
                  <div className="p-4 border-t border-gray-100 space-y-4">
                    <Input
                      label="Titre du chapitre"
                      value={ch.title}
                      onChange={(e) => updateChapter(ch.id, { title: e.target.value })}
                    />
                    <div>
                      <p className="text-sm font-medium mb-2">Vidéo</p>
                      <FileUploader
                        resourceType="video"
                        folder="avisys/videos"
                        accept="video/*"
                        value={ch.videoUrl ?? null}
                        onChange={(file) => updateChapter(ch.id, { videoUrl: file ?? undefined })}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Documents PDF</p>
                      <FileUploader
                        resourceType="raw"
                        folder="avisys/documents"
                        accept="application/pdf"
                        value={null}
                        onChange={(file) => {
                          if (file) updateChapter(ch.id, { documentUrls: [...(ch.documentUrls ?? []), file] })
                        }}
                      />
                      {(ch.documentUrls ?? []).map((d, i) => (
                        <p key={i} className="text-xs text-text-muted mt-1">{d.fileName}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Techniciens assignés</h3>
            <span className="text-xs text-text-muted ml-auto">
              {training.assignedTo?.length ?? 0} sur {techniciens.length}
            </span>
          </div>
          {techniciens.length === 0 ? (
            <p className="text-sm text-text-muted">Aucun technicien actif disponible.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {techniciens.map((t) => {
                const uid = t.uid ?? t.id
                const checked = training.assignedTo?.includes(uid)
                return (
                  <label key={uid} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                    <input type="checkbox" checked={checked} onChange={() => toggleAssign(uid)} />
                    <span className="text-sm truncate">{t.fullName}</span>
                  </label>
                )
              })}
            </div>
          )}
        </Card>

      </div>
    </>
  )
}
