import { Bell, Award, BookOpen, Calendar, Info } from 'lucide-react'
import { where, orderBy } from 'firebase/firestore'
import { updateDoc, doc } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { useCollection } from '@/hooks/useCollection'
import type { Notification } from '@/types'
import { db } from '@/lib/firebase'
import { formatRelativeDate } from '@/lib/utils'

const TYPE_ICONS = {
  certification: Award,
  formation: BookOpen,
  reunion: Calendar,
  systeme: Info,
}

function groupByDay(notifs: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  const today = new Date().toDateString()
  const weekAgo = Date.now() - 7 * 86400000

  notifs.forEach((n) => {
    const d = new Date(n.createdAt)
    let label: string
    if (d.toDateString() === today) label = "Aujourd'hui"
    else if (d.getTime() > weekAgo) label = 'Cette semaine'
    else label = 'Plus ancien'
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

export default function NotificationsPage() {
  const { profile } = useAuth()
  const { data: notifications } = useCollection<Notification>('notifications', [
    where('uid', '==', profile?.uid ?? ''),
    orderBy('createdAt', 'desc'),
  ])

  const groups = groupByDay(notifications)

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  return (
    <>
      <Header title="Notifications" subtitle="Centre de notifications" />
      <div className="p-4 md:p-8 max-w-2xl">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Vous serez notifié des échéances de certification et des activités importantes."
          />
        ) : (
          Object.entries(groups).map(([label, notifs]) => (
            <div key={label} className="mb-8">
              <h3 className="text-sm font-medium text-text-muted mb-3">{label}</h3>
              <div className="space-y-2">
                {notifs.map((n) => {
                  const Icon = TYPE_ICONS[n.type] ?? Info
                  return (
                    <Card
                      key={n.id}
                      className={`flex items-start gap-3 cursor-pointer transition-opacity ${
                        n.read ? 'opacity-60' : ''
                      }`}
                      onClick={() => !n.read && markRead(n.id)}
                    >
                      <div className="p-2 rounded-lg bg-accent-light">
                        <Icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-text-muted mt-1">{formatRelativeDate(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
