import { useState } from 'react'
import { FolderOpen, Plus, Layers, RefreshCw } from 'lucide-react'
import { addDoc, collection, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCollection } from '@/hooks/useCollection'
import type { Category, CategoryType } from '@/types'
import { CATEGORY_TYPE_LABELS } from '@/types'
import { db } from '@/lib/firebase'
import { useToast } from '@/context/ToastContext'

const AVIATION_CATEGORIES: { name: string; type: CategoryType; description: string }[] = [
  // Réglementaires
  { name: 'Human Factors', type: 'reglementaire', description: 'Facteurs humains en maintenance aéronautique' },
  { name: 'Fuel Tank Safety', type: 'reglementaire', description: 'Sécurité des réservoirs de carburant' },
  { name: 'EWIS', type: 'reglementaire', description: 'Electrical Wiring Interconnection System' },
  { name: 'Safety Management System', type: 'reglementaire', description: 'Système de gestion de la sécurité' },
  { name: 'Dangerous Goods', type: 'reglementaire', description: 'Marchandises dangereuses' },
  { name: 'Security Awareness', type: 'reglementaire', description: 'Sensibilisation à la sûreté' },
  { name: 'Fire Safety', type: 'reglementaire', description: 'Sécurité incendie' },
  { name: 'First Aid', type: 'reglementaire', description: 'Premiers secours' },
  // Techniques
  { name: 'Airbus A320', type: 'technique', description: "Formation sur l'avion Airbus A320" },
  { name: 'Boeing B737', type: 'technique', description: "Formation sur l'avion Boeing B737" },
  { name: 'ATR', type: 'technique', description: 'Formation sur les avions ATR' },
  { name: 'Avionique', type: 'technique', description: 'Systèmes avioniques' },
  { name: 'Moteurs', type: 'technique', description: 'Maintenance des moteurs' },
  { name: 'Structures', type: 'technique', description: "Structures d'aéronefs" },
  { name: 'Systèmes hydrauliques', type: 'technique', description: 'Systèmes hydrauliques' },
  { name: 'Systèmes électriques', type: 'technique', description: 'Systèmes électriques' },
  // Qualité
  { name: 'Part-145', type: 'qualite', description: 'Réglementation Part-145' },
  { name: 'Part-66', type: 'qualite', description: 'Réglementation Part-66' },
  { name: 'Part-147', type: 'qualite', description: 'Réglementation Part-147' },
  { name: 'Audits', type: 'qualite', description: 'Audits qualité' },
  { name: 'Quality Assurance', type: 'qualite', description: 'Assurance qualité' },
  { name: 'Compliance Monitoring', type: 'qualite', description: 'Surveillance de la conformité' },
  // Internes
  { name: 'Procédures internes', type: 'interne', description: "Procédures internes de l'organisation" },
  { name: 'Procédures qualité', type: 'interne', description: 'Procédures qualité internes' },
  { name: 'Processus de maintenance', type: 'interne', description: 'Processus de maintenance interne' },
]

export default function FormateurCategoriesPage() {
  const { data: categories } = useCollection<Category>('categories', [])
  const { success: toastSuccess, error: toastError } = useToast()
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'reglementaire' as CategoryType, description: '' })

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const existing = await getDocs(collection(db, 'categories'))
      const existingNames = new Set(existing.docs.map((d) => d.data().name as string))
      const toCreate = AVIATION_CATEGORIES.filter((c) => !existingNames.has(c.name))
      await Promise.all(toCreate.map((c) => addDoc(collection(db, 'categories'), c)))
      toastSuccess(`${toCreate.length} catégorie(s) créée(s)`)
    } catch {
      toastError('Erreur lors de la création des catégories')
    } finally {
      setSeeding(false)
    }
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ name: '', type: 'reglementaire', description: '' })
    setModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditId(cat.id)
    setForm({ name: cat.name, type: cat.type, description: cat.description })
    setModal(true)
  }

  const handleSave = async () => {
    if (editId) {
      await updateDoc(doc(db, 'categories', editId), form)
    } else {
      await addDoc(collection(db, 'categories'), form)
    }
    setModal(false)
  }

  const handleDelete = async () => {
    if (deleteId) await deleteDoc(doc(db, 'categories', deleteId))
    setDeleteId(null)
  }

  const grouped = Object.entries(CATEGORY_TYPE_LABELS).map(([type, label]) => ({
    type: type as CategoryType,
    label,
    items: categories.filter((c) => c.type === type),
  }))

  return (
    <>
      <Header title="Catégories" subtitle="Organisation des formations" />
      <div className="p-4 md:p-8">
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-text-muted hover:border-accent/40 hover:text-accent transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            Initialiser les catégories aviation
          </button>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Ajouter</Button>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Aucune catégorie"
            description="Créez votre première catégorie ou initialisez les catégories aviation."
            actionLabel="Créer une catégorie"
            onAction={openCreate}
          />
        ) : (
          <div className="space-y-8">
            {grouped.map(({ type, label, items }) => items.length === 0 ? null : (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-accent" />
                  <h3 className="font-bold text-sm uppercase tracking-wide text-text">{label}</h3>
                  <span className="text-xs text-text-muted">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {items.map((cat) => (
                    <div
                      key={cat.id}
                      className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-accent/20 transition-all cursor-pointer"
                      onClick={() => openEdit(cat)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-text group-hover:text-accent transition-colors truncate">{cat.name}</h4>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
                        </div>
                        <FolderOpen className="w-5 h-5 text-accent/30 group-hover:text-accent/60 shrink-0 ml-2 transition-colors" />
                      </div>
                      <button
                        className="text-xs text-danger mt-3 hover:underline"
                        onClick={(e) => { e.stopPropagation(); setDeleteId(cat.id) }}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold">{editId ? 'Modifier' : 'Nouvelle catégorie'}</h3>
            <Input label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
              options={Object.entries(CATEGORY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer la catégorie"
        message="Cette action est irréversible."
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
