import { Trash2, EyeOff } from 'lucide-react'
import { deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { useCollection } from '@/hooks/useCollection'
import type { ForumPost } from '@/types'
import { db } from '@/lib/firebase'
import { formatRelativeDate } from '@/lib/utils'

export default function FormateurForumPage() {
  const { data: posts } = useCollection<ForumPost>('forumPosts', [orderBy('createdAt', 'desc')])

  return (
    <>
      <Header title="Modération forum" subtitle="Gérer les publications" />
      <div className="p-4 md:p-8 space-y-3">
        {posts.map((post) => (
          <Card key={post.id} className="group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-xs text-text-muted mt-1">
                  {post.authorName ?? post.authorId} · {post.category} · {formatRelativeDate(post.createdAt)}
                </p>
                <p className="text-sm text-text-muted mt-2 line-clamp-2">{post.content}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => updateDoc(doc(db, 'forumPosts', post.id), { moderated: true })}
                  title="Masquer"
                >
                  <EyeOff className="w-4 h-4 text-warning" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => deleteDoc(doc(db, 'forumPosts', post.id))}
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {posts.length === 0 && <p className="text-sm text-text-muted">Aucune publication.</p>}
      </div>
    </>
  )
}
