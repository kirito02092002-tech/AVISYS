import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, FileImage, Briefcase, LogOut, Plane } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileUploader } from '@/components/ui/FileUploader'
import { useToast } from '@/context/ToastContext'
import { getFirebaseErrorMessage } from '@/lib/errors'
import type { CloudinaryFile } from '@/types'

export default function CompleteProfilePage() {
  const { profile, completeProfile, logout, loading } = useAuth()
  const { success, error: toastError } = useToast()
  const [form, setForm] = useState({
    employeeId: '',
    company: '',
    department: '',
    licenseNumber: '',
  })
  const [idDocument, setIdDocument] = useState<CloudinaryFile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loading && profile?.status !== 'incomplete') {
    return <Navigate to="/pending-approval" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idDocument) {
      setError('Veuillez uploader votre badge ou justificatif.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await completeProfile({ ...form, idDocument })
      success('Dossier envoyé ! En attente de validation admin.')
    } catch (err) {
      const msg = getFirebaseErrorMessage(err)
      setError(msg)
      toastError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent-light/20 to-background">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-primary">AVISYS</p>
              <p className="text-xs text-text-muted">Complétez votre dossier</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 mb-8"
        >
          <p className="font-semibold text-amber-900">
            Bienvenue {profile?.fullName} !
          </p>
          <p className="text-sm text-amber-800/80 mt-1">
            Votre compte est créé. Complétez votre dossier professionnel pour accéder aux formations.
            Un administrateur validera votre profil et pourra vous attribuer un rôle (technicien, RH, formateur…).
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-gray-100 p-6 md:p-8 space-y-6"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent" />
            Informations professionnelles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Matricule employé"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
            />
            <Input
              label="Entreprise / Compagnie aérienne"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
            <Input
              label="Département"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            />
            <Input
              label="N° de licence (optionnel)"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileImage className="w-4 h-4 text-accent" />
              Badge / Justificatif *
            </h3>
            <FileUploader
              label="Glissez votre badge ou photo d'identité ici"
              resourceType="image"
              folder="avisys/badges"
              value={idDocument}
              onChange={setIdDocument}
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button type="submit" className="w-full rounded-xl" size="lg" loading={submitting}>
            <BadgeCheck className="w-5 h-5" />
            Soumettre mon dossier pour validation
          </Button>
        </motion.form>
      </div>
    </div>
  )
}
