import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Plus } from 'lucide-react'
import { addDoc, collection, orderBy } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { useCollection } from '@/hooks/useCollection'
import type { ForumPost } from '@/types'
import { db } from '@/lib/firebase'
import { formatRelativeDate, sanitizeText } from '@/lib/utils'

export default function TechnicienForumPage() {
  const { profile } = useAuth()
  const { data: posts } = useCollection<ForumPost>('forumPosts', [orderBy('createdAt', 'desc')])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'general' })

  const visiblePosts = posts.filter((p) => !p.moderated)

  const handleCreate = async () => {
    await addDoc(collection(db, 'forumPosts'), {
      title: sanitizeText(form.title),
      content: sanitizeText(form.content),
      authorId: profile!.uid,
      authorName: profile!.fullName,
      category: form.category,
      createdAt: new Date().toISOString(),
      moderated: false,
    })
    setModal(false)
    setForm({ title: '', content: '', category: 'general' })
  }

  return (
    <>
      <Header title="Forum" subtitle="Échanges entre techniciens" />
      <div className="p-4 md:p-8">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Nouvelle question</Button>
        </div>

        {visiblePosts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Aucune discussion"
            description="Soyez le premier à poser une question."
            actionLabel="Nouvelle question"
            onAction={() => setModal(true)}
          />
        ) : (
          <div className="space-y-3">
            {visiblePosts.map((post) => (
              <Link key={post.id} to={`/forum/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-xs text-text-muted mt-1">
                    {post.authorName ?? post.authorId} · {post.category} · {formatRelativeDate(post.createdAt)}
                  </p>
                  <p className="text-sm text-text-muted mt-2 line-clamp-2">{post.content}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold">Nouvelle question</h3>
            <Input label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select
              label="Catégorie"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                { value: 'general', label: 'Général' },
                { value: 'technique', label: 'Technique' },
                { value: 'reglementaire', label: 'Réglementaire' },
              ]}
            />
            <Textarea label="Contenu" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
              <Button onClick={handleCreate}>Publier</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
