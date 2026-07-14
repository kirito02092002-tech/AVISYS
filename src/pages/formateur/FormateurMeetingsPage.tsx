import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Video, Trash2 } from 'lucide-react'
import { addDoc, collection, deleteDoc, doc, where, orderBy } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCollection } from '@/hooks/useCollection'
import type { Meeting, AppUser } from '@/types'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { formatDateTime } from '@/lib/utils'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

function MiniCalendar({ meetings, onSchedule }: { meetings: Meeting[]; onSchedule: () => void }) {
  const [current, setCurrent] = useState(new Date())
  const year = current.getFullYear()
  const month = current.getMonth()
  const today = new Date()

  const meetingDays = new Set(meetings.map((m) => {
    const d = new Date(m.date)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }))

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
  const hasMeeting = (d: number) => meetingDays.has(`${year}-${month}-${d}`)

  return (
    <div className="flex flex-col items-center py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-base text-text">{MONTHS[month]} {year}</h3>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0 mb-2">
          {DAYS.map((d) => <div key={d} className="text-center text-xs font-semibold text-text-muted py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {cells.map((d, i) => (
            <div key={i} className="flex items-center justify-center py-1">
              {d ? (
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                  ${isToday(d) ? 'bg-accent text-white font-bold shadow-sm' : ''}
                  ${hasMeeting(d) && !isToday(d) ? 'bg-success text-white shadow-sm' : ''}
                  ${!isToday(d) && !hasMeeting(d) ? 'text-text hover:bg-gray-100' : ''}
                `}>{d}</div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-accent" /><span className="text-xs text-text-muted">Aujourd'hui</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-success" /><span className="text-xs text-text-muted">Réunion</span></div>
        </div>
      </div>
      <p className="text-text-muted text-sm mt-4">Aucune réunion planifiée.</p>
      <Button className="mt-3" onClick={onSchedule}><Plus className="w-4 h-4" /> Planifier une réunion</Button>
    </div>
  )
}

function CalendarOnly({ meetings }: { meetings: Meeting[] }) {
  const [current, setCurrent] = useState(new Date())
  const year = current.getFullYear()
  const month = current.getMonth()
  const today = new Date()

  const meetingDays = new Set(meetings.map((m) => {
    const d = new Date(m.date)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }))

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
  const hasMeeting = (d: number) => meetingDays.has(`${year}-${month}-${d}`)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-bold text-base text-text">{MONTHS[month]} {year}</h3>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 mb-2">
        {DAYS.map((d) => <div key={d} className="text-center text-xs font-semibold text-text-muted py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center py-1">
            {d ? (
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                ${isToday(d) ? 'bg-accent text-white font-bold shadow-sm' : ''}
                ${hasMeeting(d) && !isToday(d) ? 'bg-success text-white shadow-sm' : ''}
                ${!isToday(d) && !hasMeeting(d) ? 'text-text hover:bg-gray-100' : ''}
              `}>{d}</div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-accent" /><span className="text-xs text-text-muted">Aujourd'hui</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-success" /><span className="text-xs text-text-muted">Réunion</span></div>
      </div>
    </div>
  )
}

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
  const upcoming = meetings.filter((m) => new Date(m.date) >= new Date())
  const past = meetings.filter((m) => new Date(m.date) < new Date())

  const handleCreate = async () => {
    await addDoc(collection(db, 'meetings'), {
      ...form, date: new Date(form.date).toISOString(), createdBy: profile!.uid,
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
          <MiniCalendar meetings={[]} onSchedule={() => setDrawer(true)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CalendarOnly meetings={meetings} />
            </div>
            <div className="lg:col-span-2 space-y-4">
              {upcoming.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">À venir</h3>
                  <div className="space-y-3">
                    {upcoming.map((m) => (
                      <Card key={m.id} className="flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                          <h4 className="font-semibold">{m.title}</h4>
                          <p className="text-sm text-text-muted">{formatDateTime(m.date)}</p>
                          <p className="text-xs text-text-muted mt-1">{m.invitedUids.length} participant(s)</p>
                        </div>
                        <div className="flex gap-2">
                          {m.link && <a href={m.link} target="_blank" rel="noreferrer"><Button size="sm" variant="secondary"><Video className="w-4 h-4" /> Lien</Button></a>}
                          <button onClick={() => deleteDoc(doc(db, 'meetings', m.id))} className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Passées</h3>
                  <div className="space-y-2">
                    {past.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
                        <div><p className="font-medium text-sm">{m.title}</p><p className="text-xs text-text-muted">{formatDateTime(m.date)}</p></div>
                        <button onClick={() => deleteDoc(doc(db, 'meetings', m.id))} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="relative w-full max-w-md bg-white h-full p-6 overflow-y-auto shadow-2xl">
            <h3 className="font-bold text-lg mb-6">Planifier une réunion</h3>
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
                      <label key={uid} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={form.invitedUids.includes(uid)}
                          onChange={(e) => setForm({ ...form, invitedUids: e.target.checked ? [...form.invitedUids, uid] : form.invitedUids.filter((u) => u !== uid) })} />
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
