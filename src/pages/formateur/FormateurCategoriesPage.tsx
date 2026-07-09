import { useState } from 'react'
import { FolderOpen, Plus } from 'lucide-react'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCollection } from '@/hooks/useCollection'
import type { Category, CategoryType } from '@/types'
import { CATEGORY_TYPE_LABELS } from '@/types'
import { db } from '@/lib/firebase'

export default function FormateurCategoriesPage() {
  const { data: categories } = useCollection<Category>('categories', [])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: 'reglementaire' as CategoryType, description: '' })

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

  return (
    <>
      <Header title="Catégories" subtitle="Organisation des formations" />
      <div className="p-4 md:p-8">
        <div className="flex justify-end mb-4">
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Ajouter</Button>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Aucune catégorie"
            description="Créez votre première catégorie de formation."
            actionLabel="Créer une catégorie"
            onAction={openCreate}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(cat)}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-accent uppercase">{CATEGORY_TYPE_LABELS[cat.type]}</span>
                    <h3 className="font-semibold mt-1">{cat.name}</h3>
                    <p className="text-sm text-text-muted mt-2 line-clamp-2">{cat.description}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-accent/40" />
                </div>
                <button
                  className="text-xs text-danger mt-4 hover:underline"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(cat.id) }}
                >
                  Supprimer
                </button>
              </Card>
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
