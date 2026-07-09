import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore'
import { Award, RotateCcw } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import type { Quiz, Training } from '@/types'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { generateCertificatePDF } from '@/lib/exports'
import { computeCertStatus } from '@/lib/utils'
import { createNotification } from '@/lib/firestore'

export default function TechnicienQuizPage() {
  const { id: trainingId } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [training, setTraining] = useState<Training | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!trainingId) return
    getDocs(query(collection(db, 'quizzes'), where('trainingId', '==', trainingId))).then((snap) => {
      if (!snap.empty) setQuiz({ id: snap.docs[0].id, ...snap.docs[0].data() } as Quiz)
    })
    getDoc(doc(db, 'trainings', trainingId)).then((snap) => {
      if (snap.exists()) setTraining({ id: snap.id, ...snap.data() } as Training)
    })
  }, [trainingId])

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQ] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQ < (quiz?.questions.length ?? 0) - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      finishQuiz([...answers])
    }
  }

  const finishQuiz = async (finalAnswers: number[]) => {
    if (!quiz || !profile || !trainingId || !training) return
    setSubmitting(true)

    let correct = 0
    quiz.questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctAnswer) correct++
    })
    const pct = Math.round((correct / quiz.questions.length) * 100)
    const didPass = pct >= quiz.passingScore

    setScore(pct)
    setPassed(didPass)
    setFinished(true)

    await addDoc(collection(db, 'quizAttempts'), {
      uid: profile.uid,
      quizId: quiz.id,
      trainingId,
      score: pct,
      answers: finalAnswers,
      attemptDate: new Date().toISOString(),
      passed: didPass,
    })

    if (didPass) {
      const issueDate = new Date()
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)

      const certData = {
        uid: profile.uid,
        trainingId,
        name: training.title,
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        authority: 'AVISYS / EASA Part-147',
        status: computeCertStatus(expiryDate.toISOString()),
      }

      const pdfBlob = generateCertificatePDF(profile, training, {
        ...certData,
        id: '',
      } as Parameters<typeof generateCertificatePDF>[2])

      const pdfFile = new File([pdfBlob], `certificat-${trainingId}.pdf`, { type: 'application/pdf' })
      const uploaded = await uploadToCloudinary(pdfFile, { folder: 'avisys/certificates', resourceType: 'raw' })

      await addDoc(collection(db, 'certifications'), {
        ...certData,
        pdfUrl: uploaded,
      })

      await createNotification(
        profile.uid,
        'certification',
        `Félicitations ! Vous avez obtenu la certification "${training.title}".`,
      )
    }

    setSubmitting(false)
  }

  if (!quiz) {
    return <><Header title="Quiz" /><p className="p-8 text-text-muted">Aucun quiz disponible pour cette formation.</p></>
  }

  if (finished) {
    return (
      <>
        <Header title="Résultat" />
        <div className="p-4 md:p-8 flex justify-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Card className="max-w-md text-center">
              <motion.p
                className="text-6xl font-bold mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: passed ? '#1E9E6B' : '#D9534F' }}
              >
                {score}%
              </motion.p>
              <p className="text-lg font-semibold mb-2">
                {passed ? 'Félicitations, vous avez réussi !' : 'Échec — score insuffisant'}
              </p>
              <p className="text-sm text-text-muted mb-6">
                Score requis : {quiz.passingScore}%
              </p>
              {passed ? (
                <Link to="/certifications">
                  <Button><Award className="w-4 h-4" /> Voir mon certificat</Button>
                </Link>
              ) : (
                <Button variant="secondary" onClick={() => { setFinished(false); setCurrentQ(0); setAnswers([]) }}>
                  <RotateCcw className="w-4 h-4" /> Réessayer
                </Button>
              )}
            </Card>
          </motion.div>
        </div>
      </>
    )
  }

  const question = quiz.questions[currentQ]

  return (
    <>
      <Header title="Quiz" subtitle={`Question ${currentQ + 1}/${quiz.questions.length}`} />
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <ProgressBar value={((currentQ + 1) / quiz.questions.length) * 100} className="mb-6" />

        <Card>
          <h3 className="font-semibold text-lg mb-6">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  answers[currentQ] === i
                    ? 'border-accent bg-accent-light'
                    : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <Button
            className="mt-6 w-full"
            onClick={handleNext}
            disabled={answers[currentQ] === undefined || submitting}
            loading={submitting}
          >
            {currentQ < quiz.questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
          </Button>
        </Card>
      </div>
    </>
  )
}
