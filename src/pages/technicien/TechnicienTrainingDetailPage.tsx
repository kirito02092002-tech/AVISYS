import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  doc, getDoc, collection, getDocs, query, orderBy,
  setDoc, addDoc,
} from 'firebase/firestore'
import { CheckCircle, FileText, HelpCircle, Download } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import type { Training, Chapter, Progress } from '@/types'
import { computeProgress, downloadFile } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import { where } from 'firebase/firestore'
import { useCollection } from '@/hooks/useCollection'

export default function TechnicienTrainingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { error: toastError } = useToast()
  const [training, setTraining] = useState<Training | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { data: progressList } = useCollection<Progress>('progress', [
    where('uid', '==', profile?.uid ?? ''),
    where('trainingId', '==', id ?? ''),
  ])

  const progress = progressList[0]
  const completedIds = progress?.completedChapters ?? []
  const percentage = progress?.percentage ?? 0
  const allComplete = chapters.length > 0 && completedIds.length >= chapters.length

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)
    Promise.all([
      getDoc(doc(db, 'trainings', id)),
      getDocs(query(collection(db, 'trainings', id, 'chapters'), orderBy('order'))),
    ])
      .then(([trainingSnap, chaptersSnap]) => {
        if (trainingSnap.exists()) {
          setTraining({ id: trainingSnap.id, ...trainingSnap.data() } as Training)
        }
        const chs = chaptersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chapter)
        setChapters(chs)
        if (chs.length > 0) setActiveChapter(chs[0])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const markChapterComplete = async (chapterId: string) => {
    if (!profile || !id) return
    const newCompleted = completedIds.includes(chapterId)
      ? completedIds
      : [...completedIds, chapterId]
    const pct = computeProgress(newCompleted.length, chapters.length)
    const data = {
      uid: profile.uid,
      trainingId: id,
      completedChapters: newCompleted,
      percentage: pct,
      lastAccessed: new Date().toISOString(),
    }
    if (progress?.id) {
      await setDoc(doc(db, 'progress', progress.id), data)
    } else {
      await addDoc(collection(db, 'progress'), data)
    }
  }

  if (loading) {
    return <><Header title="Formation" /><PageLoader title="Chargement de la formation" /></>
  }

  if (error || !training) {
    return (
      <>
        <Header title="Formation" />
        <ErrorState
          title="Formation introuvable"
          description="Impossible de charger cette formation. Vérifiez votre connexion ou réessayez."
          onRetry={() => window.location.reload()}
        />
      </>
    )
  }

  return (
    <>
      <Header title={training.title} subtitle="Lecteur de formation" />
      <div className="p-4 md:p-8">
        <div className="sticky top-16 z-10 bg-background py-2 mb-4">
          <ProgressBar value={percentage} showLabel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {activeChapter?.videoUrl?.url ? (
              <Card padding={false} className="overflow-hidden">
                <video
                  key={activeChapter.id}
                  src={activeChapter.videoUrl.url}
                  controls
                  className="w-full aspect-video bg-black"
                />
              </Card>
            ) : (
              <Card className="aspect-video flex items-center justify-center bg-gray-100">
                <p className="text-text-muted">Aucune vidéo pour ce chapitre</p>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold">{activeChapter?.title ?? 'Chapitre'}</h3>
              {(activeChapter?.documentUrls ?? []).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Documents</p>
                  {activeChapter!.documentUrls.map((d, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline min-w-0"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{d.fileName} ({(d.fileSize / 1024).toFixed(0)} Ko)</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadFile(d.url, d.fileName).catch((err) => toastError(err instanceof Error ? err.message : 'Impossible de télécharger le document'))}
                        className="p-1.5 rounded-lg hover:bg-accent-light text-accent shrink-0"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {activeChapter && !completedIds.includes(activeChapter.id) && (
                <Button className="mt-4" size="sm" onClick={() => markChapterComplete(activeChapter.id)}>
                  Marquer comme terminé
                </Button>
              )}
            </Card>

            {allComplete && (
              <Link to={`/trainings/${id}/quiz`}>
                <Button className="w-full"><HelpCircle className="w-4 h-4" /> Passer au quiz</Button>
              </Link>
            )}
          </div>

          <Card>
            <h3 className="font-semibold mb-4">Chapitres</h3>
            <div className="space-y-1">
              {chapters.map((ch) => {
                const done = completedIds.includes(ch.id)
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch)}
                    className={`w-full flex items-center gap-2 p-3 rounded-lg text-left text-sm transition-colors ${
                      activeChapter?.id === ch.id ? 'bg-accent-light text-primary' : 'hover:bg-gray-50'
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                    )}
                    <span className="truncate">{ch.title}</span>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
