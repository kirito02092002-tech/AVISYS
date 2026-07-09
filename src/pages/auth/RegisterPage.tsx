import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, User, Phone } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { getFirebaseErrorMessage } from '@/lib/errors'
import { getPostLoginRoute } from '@/types'

export default function RegisterPage() {
  const { register, user, profile, loading } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && profile) {
    return <Navigate to={getPostLoginRoute(profile)} replace />
  }

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      })
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez la plateforme AVISYS en quelques secondes"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-[38px] w-4 h-4 text-text-muted z-10" />
          <Input
            label="Nom complet"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className="pl-10 rounded-xl"
            required
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-[38px] w-4 h-4 text-text-muted z-10" />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="pl-10 rounded-xl"
            required
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-[38px] w-4 h-4 text-text-muted z-10" />
          <Input
            label="Téléphone (optionnel)"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <PasswordInput
          label="Mot de passe"
          value={form.password}
          onChange={(v) => update('password', v)}
          required
        />
        <PasswordInput
          label="Confirmer le mot de passe"
          value={form.confirmPassword}
          onChange={(v) => update('confirmPassword', v)}
          required
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" className="w-full rounded-xl" loading={submitting} size="lg">
          Créer mon compte
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-6">
        Déjà inscrit ?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}
