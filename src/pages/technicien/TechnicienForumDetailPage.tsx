import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { Textarea } from '@/components/ui/Input'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import type { ForumPost, ForumComment } from '@/types'
import { formatRelativeDate, sanitizeText } from '@/lib/utils'

export default function TechnicienForumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [reply, setReply] = useState('')

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'forumPosts', id)).then((snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() } as ForumPost)
    })
    getDocs(
      collection(db, 'forumPosts', id, 'comments'),
      // orderBy handled client-side if index missing
    ).then((snap) => {
      const cs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ForumComment)
      cs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      setComments(cs)
    })
  }, [id])

  const handleReply = async () => {
    if (!id || !reply.trim() || !profile) return
    await addDoc(collection(db, 'forumPosts', id, 'comments'), {
      content: sanitizeText(reply),
      authorId: profile.uid,
      authorName: profile.fullName,
      createdAt: new Date().toISOString(),
    })
    setReply('')
    const snap = await getDocs(collection(db, 'forumPosts', id, 'comments'))
    const cs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ForumComment)
    cs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    setComments(cs)
  }

  if (!post) {
    return <><Header title="Discussion" /><PageLoader title="Chargement de la discussion" /></>
  }

  return (
    <>
      <Header title={post.title} subtitle={`${post.category} · ${post.authorName}`} />
      <div className="p-4 md:p-8 max-w-3xl space-y-6 pb-32">
        <Card>
          <p className="text-xs text-text-muted mb-3">{formatRelativeDate(post.createdAt)}</p>
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        </Card>

        <div className="space-y-3">
          <h3 className="font-semibold">{comments.length} réponse(s)</h3>
          {comments.map((c) => (
            <Card key={c.id}>
              <p className="text-xs text-text-muted mb-2">
                {c.authorName ?? c.authorId} · {formatRelativeDate(c.createdAt)}
              </p>
              <p className="text-sm whitespace-pre-wrap">{c.content}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-60 right-0 bg-surface border-t border-gray-100 p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Votre réponse..."
            className="min-h-[60px]"
          />
          <Button onClick={handleReply} className="shrink-0 self-end">Répondre</Button>
        </div>
      </div>
    </>
  )
}
