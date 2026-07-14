import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { PageLoader } from '@/components/ui/PageLoader'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { ForumPost, ForumComment } from '@/types'
import { formatRelativeDate, formatDateTime, sanitizeText, decodeHtmlEntities } from '@/lib/utils'
import { Send, Trash2, EyeOff, ChevronLeft } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-accent/10 text-accent',
  technique: 'bg-success/10 text-success',
  reglementaire: 'bg-warning/10 text-warning',
}
const CATEGORY_LABELS: Record<string, string> = {
  general: 'Général', technique: 'Technique', reglementaire: 'Réglementaire',
}
const BORDER_COLORS: Record<string, string> = {
  general: 'border-l-accent', technique: 'border-l-success', reglementaire: 'border-l-warning',
}

export default function FormateurForumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [reply, setReply] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'forumPosts', id)).then((snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() } as ForumPost)
    })
    loadComments()
  }, [id])

  const loadComments = async () => {
    if (!id) return
    const snap = await getDocs(collection(db, 'forumPosts', id, 'comments'))
    const cs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ForumComment)
    cs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    setComments(cs)
  }

  const handleReply = async () => {
    if (!id || !reply.trim() || !profile) return
    await addDoc(collection(db, 'forumPosts', id, 'comments'), {
      content: sanitizeText(reply),
      authorId: profile.uid,
      authorName: profile.fullName,
      createdAt: new Date().toISOString(),
    })
    setReply('')
    success('Réponse publiée')
    loadComments()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReply()
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!id) return
    await deleteDoc(doc(db, 'forumPosts', id, 'comments', commentId))
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const deletePost = async () => {
    if (!id) return
    await deleteDoc(doc(db, 'forumPosts', id))
    success('Publication supprimée')
    navigate('/formateur/forum')
  }

  const moderatePost = async () => {
    if (!id) return
    await updateDoc(doc(db, 'forumPosts', id), { moderated: true })
    success('Publication masquée')
    navigate('/formateur/forum')
  }

  if (!post) {
    return <><Header title="Discussion" /><PageLoader title="Chargement..." /></>
  }

  return (
    <>
      <Header title="Discussion" subtitle={`${CATEGORY_LABELS[post.category] ?? post.category} · ${post.authorName}`} />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 pb-36">

        <button
          onClick={() => navigate('/formateur/forum')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Retour au forum
        </button>

        {/* Post card */}
        <div className={`bg-white rounded-xl shadow-sm border-l-4 border-r border-t border-b border-gray-100 overflow-hidden ${BORDER_COLORS[post.category] ?? 'border-l-gray-300'}`}>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {CATEGORY_LABELS[post.category] ?? post.category}
                  </span>
                  <span className="text-xs text-text-muted">{formatRelativeDate(post.createdAt)}</span>
                </div>
                <h2 className="text-lg font-bold text-text mb-3">{decodeHtmlEntities(post.title)}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    {(post.authorName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text">{post.authorName}</span>
                </div>
                <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{decodeHtmlEntities(post.content)}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={moderatePost} title="Masquer" className="p-2 rounded-lg hover:bg-warning/10 text-text-muted hover:text-warning transition-colors">
                  <EyeOff className="w-4 h-4" />
                </button>
                <button onClick={deletePost} title="Supprimer" className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
            {comments.length} réponse{comments.length !== 1 ? 's' : ''}
          </h3>
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-100 p-4 group hover:border-accent/20 hover:shadow-sm transition-all"
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 mb-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(c.authorName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text">{c.authorName ?? c.authorId}</span>
                    <span className="text-xs text-text-muted ml-2 transition-all">
                      {hoveredId === c.id ? formatDateTime(c.createdAt) : formatRelativeDate(c.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteComment(c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger/10 text-danger transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-text whitespace-pre-wrap pl-9 leading-relaxed">{decodeHtmlEntities(c.content)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed reply bar */}
      <div className="fixed bottom-0 left-0 lg:left-60 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-10">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
            {profile?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Répondre… (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
              className="w-full px-4 py-3 pr-12 text-sm bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              rows={2}
            />
            <button
              onClick={handleReply}
              disabled={!reply.trim()}
              className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
