import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Trash2, EyeOff, TrendingUp, Clock, MessageCircle, Plus, Filter } from 'lucide-react'
import { deleteDoc, doc, updateDoc, orderBy, addDoc, collection } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useCollection } from '@/hooks/useCollection'
import type { ForumPost } from '@/types'
import { db } from '@/lib/firebase'
import { formatRelativeDate, decodeHtmlEntities, sanitizeText } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['Tous', 'general', 'technique', 'reglementaire'] as const
const CATEGORY_LABELS: Record<string, string> = {
  Tous: 'Tous', general: 'Général', technique: 'Technique', reglementaire: 'Réglementaire',
}
const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-accent/10 text-accent border-accent/20',
  technique: 'bg-success/10 text-success border-success/20',
  reglementaire: 'bg-warning/10 text-warning border-warning/20',
}
const BORDER_COLORS: Record<string, string> = {
  general: 'border-l-accent', technique: 'border-l-success', reglementaire: 'border-l-warning',
}

type SortKey = 'recent' | 'popular' | 'unanswered'

export default function FormateurForumPage() {
  const { profile } = useAuth()
  const { data: posts } = useCollection<ForumPost>('forumPosts', [orderBy('createdAt', 'desc')])
  const [sortBy, setSortBy] = useState<SortKey>('recent')
  const [categoryFilter, setCategoryFilter] = useState('Tous')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'general' })

  const visiblePosts = posts.filter((p) => !p.moderated)
  const filtered = visiblePosts.filter((p) => categoryFilter === 'Tous' || p.category === categoryFilter)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'popular') return (b.commentCount ?? 0) - (a.commentCount ?? 0)
    if (sortBy === 'unanswered') return (a.commentCount ?? 0) - (b.commentCount ?? 0)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    await addDoc(collection(db, 'forumPosts'), {
      title: sanitizeText(form.title),
      content: sanitizeText(form.content),
      authorId: profile!.uid,
      authorName: profile!.fullName,
      category: form.category,
      createdAt: new Date().toISOString(),
      moderated: false,
      commentCount: 0,
    })
    setModal(false)
    setForm({ title: '', content: '', category: 'general' })
  }

  return (
    <>
      <Header title="Forum" subtitle="Modération et échanges" />
      <div className="p-4 md:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            {([
              { key: 'recent', label: 'Récents', Icon: Clock },
              { key: 'popular', label: 'Populaires', Icon: TrendingUp },
              { key: 'unanswered', label: 'Sans réponse', Icon: MessageCircle },
            ] as { key: SortKey; label: string; Icon: typeof Clock }[]).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === key ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:bg-gray-50 hover:text-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
          <Button onClick={() => setModal(true)} size="sm"><Plus className="w-4 h-4" /> Publier</Button>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap items-center">
          <Filter className="w-4 h-4 text-text-muted shrink-0" />
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                categoryFilter === cat ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-text-muted border-gray-200 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
          <span className="ml-auto text-xs text-text-muted">{sorted.length} publication{sorted.length !== 1 ? 's' : ''}</span>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-text-muted/40" />
            </div>
            <p className="font-semibold text-text-muted">Aucune publication</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((post) => (
              <div key={post.id} className={`group bg-white rounded-xl shadow-sm border-l-4 border-r border-t border-b border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-px transition-all ${BORDER_COLORS[post.category] ?? 'border-l-gray-300'}`}>
                <Link to={`/formateur/forum/${post.id}`} className="block p-4 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(post.authorName ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {CATEGORY_LABELS[post.category] ?? post.category}
                        </span>
                        <span className="text-xs text-text-muted">{post.authorName} · {formatRelativeDate(post.createdAt)}</span>
                        {(post.commentCount ?? 0) > 0 && (
                          <span className="ml-auto flex items-center gap-1 text-xs text-text-muted">
                            <MessageCircle className="w-3 h-3" />{post.commentCount}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-text group-hover:text-accent transition-colors">{decodeHtmlEntities(post.title)}</h3>
                      <p className="text-sm text-text-muted mt-1 line-clamp-2 leading-relaxed">{decodeHtmlEntities(post.content)}</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center px-4 py-2 border-t border-gray-50 bg-gray-50/50">
                  <Link to={`/formateur/forum/${post.id}`} className="text-xs text-accent font-medium hover:underline">Voir la discussion →</Link>
                  <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-warning/10 rounded-lg text-text-muted hover:text-warning transition-colors"
                      onClick={(e) => { e.preventDefault(); updateDoc(doc(db, 'forumPosts', post.id), { moderated: true }) }} title="Masquer">
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger transition-colors"
                      onClick={(e) => { e.preventDefault(); deleteDoc(doc(db, 'forumPosts', post.id)) }} title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg">Nouvelle publication</h3>
            <Input label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select label="Catégorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[{ value: 'general', label: 'Général' }, { value: 'technique', label: 'Technique' }, { value: 'reglementaire', label: 'Réglementaire' }]} />
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
