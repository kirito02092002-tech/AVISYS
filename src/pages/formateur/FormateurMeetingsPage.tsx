import { useState } from 'react'
import { Calendar, Plus, Video } from 'lucide-react'
import { addDoc, collection, deleteDoc, doc, where, orderBy } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCollection } from '@/hooks/useCollection'
import type { Meeting, AppUser } from '@/types'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { formatDateTime } from '@/lib/utils'

export default function FormateurMeetingsPage() {
  const { profile } = useAuth()
  const { data: meetings } = useCollection<Meeting>('meetings', [
    where('createdBy', '==', profile?.uid ?? ''),
    orderBy('date', 'asc'),
  ])
  const { data: users } = useCollection<AppUser & { id: string }>('users', [])
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', link: '', invitedUids: [] as string[] })

  const techniciens = users.filter((u) => u.role === 'technicien' && u.status === 'active')

  const handleCreate = async () => {
    await addDoc(collection(db, 'meetings'), {
      ...form,
      date: new Date(form.date).toISOString(),
      createdBy: profile!.uid,
    })
    setDrawer(false)
    setForm({ title: '', date: '', link: '', invitedUids: [] })
  }

  return (
    <>
      <Header title="Réunions" subtitle="Planification et invitations" />
      <div className="p-4 md:p-8">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setDrawer(true)}><Plus className="w-4 h-4" /> Planifier</Button>
        </div>

        {meetings.length === 0 ? (
          <EmptyState icon={Calendar} title="Aucune réunion" description="Planifiez votre première réunion." actionLabel="Planifier" onAction={() => setDrawer(true)} />
        ) : (
          <div className="grid gap-4">
            {meetings.map((m) => (
              <Card key={m.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="text-sm text-text-muted">{formatDateTime(m.date)}</p>
                  <p className="text-xs text-text-muted mt-1">{m.invitedUids.length} participant(s)</p>
                </div>
                <div className="flex gap-2">
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="secondary"><Video className="w-4 h-4" /> Lien</Button>
                    </a>
                  )}
                  <Button size="sm" variant="danger" onClick={() => deleteDoc(doc(db, 'meetings', m.id))}>Supprimer</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="relative w-full max-w-md bg-surface h-full p-6 overflow-y-auto shadow-xl">
            <h3 className="font-semibold text-lg mb-6">Planifier une réunion</h3>
            <div className="space-y-4">
              <Input label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Date et heure" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input label="Lien visio" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              <div>
                <p className="text-sm font-medium mb-2">Participants</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {techniciens.map((t) => {
                    const uid = t.uid ?? t.id
                    return (
                      <label key={uid} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.invitedUids.includes(uid)}
                          onChange={(e) => {
                            setForm({
                              ...form,
                              invitedUids: e.target.checked
                                ? [...form.invitedUids, uid]
                                : form.invitedUids.filter((u) => u !== uid),
                            })
                          }}
                        />
                        {t.fullName}
                      </label>
                    )
                  })}
                </div>
              </div>
              <Button className="w-full" onClick={handleCreate}>Créer la réunion</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
