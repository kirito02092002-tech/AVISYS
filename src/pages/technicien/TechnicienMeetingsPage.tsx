import { Calendar, Video } from 'lucide-react'
import { orderBy } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { useCollection } from '@/hooks/useCollection'
import type { Meeting } from '@/types'
import { formatDateTime } from '@/lib/utils'

export default function TechnicienMeetingsPage() {
  const { profile } = useAuth()
  const { data: allMeetings } = useCollection<Meeting>('meetings', [orderBy('date', 'asc')])

  const myMeetings = allMeetings.filter((m) => m.invitedUids?.includes(profile?.uid ?? ''))
  const now = new Date()

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toDateString() === now.toDateString()
  }

  return (
    <>
      <Header title="Réunions" subtitle="Vos invitations" />
      <div className="p-4 md:p-8">
        {myMeetings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucune réunion"
            description="Vous n'êtes invité à aucune réunion pour le moment."
          />
        ) : (
          <div className="grid gap-4">
            {myMeetings.map((m) => {
              const meetingDate = new Date(m.date)
              const canJoin = isToday(m.date) && meetingDate >= now
              const countdown = meetingDate > now
                ? Math.ceil((meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 0

              return (
                <Card key={m.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="text-sm text-text-muted">{formatDateTime(m.date)}</p>
                    {!canJoin && countdown > 0 && (
                      <p className="text-xs text-text-muted mt-1">Dans {countdown} jour(s)</p>
                    )}
                  </div>
                  {m.link ? (
                    canJoin ? (
                      <a href={m.link} target="_blank" rel="noreferrer">
                        <Button size="sm"><Video className="w-4 h-4" /> Rejoindre</Button>
                      </a>
                    ) : (
                      <Button size="sm" disabled variant="secondary">
                        {countdown > 0 ? `J-${countdown}` : 'Terminée'}
                      </Button>
                    )
                  ) : null}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
