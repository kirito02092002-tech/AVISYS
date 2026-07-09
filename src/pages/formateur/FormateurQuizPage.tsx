import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/PageLoader'
import { db } from '@/lib/firebase'
import type { Quiz, QuizQuestion } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FormateurQuizPage() {
  const { id: trainingId } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [passingScore, setPassingScore] = useState(70)

  useEffect(() => {
    if (!trainingId) return
    getDocs(query(collection(db, 'quizzes'), where('trainingId', '==', trainingId))).then((snap) => {
      if (!snap.empty) {
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as Quiz
        setQuiz(data)
        setPassingScore(data.passingScore)
      } else {
        setQuiz({
          id: '',
          trainingId,
          type: 'examen_final',
          questions: [],
          passingScore: 70,
        })
      }
    })
  }, [trainingId])

  const addQuestion = () => {
    if (!quiz) return
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
      ],
    })
  }

  const updateQuestion = (index: number, data: Partial<QuizQuestion>) => {
    if (!quiz) return
    const questions = [...quiz.questions]
    questions[index] = { ...questions[index], ...data }
    setQuiz({ ...quiz, questions })
  }

  const removeQuestion = (index: number) => {
    if (!quiz) return
    setQuiz({ ...quiz, questions: quiz.questions.filter((_, i) => i !== index) })
  }

  const saveQuiz = async () => {
    if (!quiz || !trainingId) return
    const data = {
      trainingId,
      type: quiz.type,
      questions: quiz.questions,
      passingScore,
    }
    if (quiz.id) {
      await setDoc(doc(db, 'quizzes', quiz.id), data)
    } else {
      const ref = doc(collection(db, 'quizzes'))
      await setDoc(ref, data)
      setQuiz({ ...quiz, id: ref.id })
    }
  }

  if (!quiz) return <><Header title="Quiz" /><PageLoader title="Chargement du quiz" /></>

  return (
    <>
      <Header title="Constructeur de quiz" subtitle="Examen final de la formation" />
      <div className="p-4 md:p-8 max-w-3xl space-y-4">
        <Card>
          <Input
            label="Score de passage requis (%)"
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            min={0}
            max={100}
          />
        </Card>

        {quiz.questions.map((q, qi) => (
          <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Question {qi + 1}</h4>
                <button onClick={() => removeQuestion(qi)}><Trash2 className="w-4 h-4 text-danger" /></button>
              </div>
              <Input
                label="Question"
                value={q.question}
                onChange={(e) => updateQuestion(qi, { question: e.target.value })}
              />
              <div className="mt-4 space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctAnswer === oi}
                      onChange={() => updateQuestion(qi, { correctAnswer: oi })}
                    />
                    <input
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                      value={opt}
                      placeholder={`Option ${oi + 1}`}
                      onChange={(e) => {
                        const options = [...q.options]
                        options[oi] = e.target.value
                        updateQuestion(qi, { options })
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={addQuestion}><Plus className="w-4 h-4" /> Ajouter une question</Button>
          <Button onClick={saveQuiz}>Enregistrer le quiz</Button>
        </div>
      </div>
    </>
  )
}
