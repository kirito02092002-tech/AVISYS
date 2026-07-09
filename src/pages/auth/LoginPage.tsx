import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { getPostLoginRoute } from '@/types'

export default function LoginPage() {
  const { login, user, profile, loading } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState((location.state as { error?: string })?.error ?? '')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && profile) {
    return <Navigate to={getPostLoginRoute(profile)} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Gestion des formations aéronautiques"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-[38px] w-4 h-4 text-text-muted z-10" />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 rounded-xl"
            required
          />
        </div>
        <PasswordInput
          label="Mot de passe"
          value={password}
          onChange={setPassword}
          required
        />
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        <Button type="submit" className="w-full rounded-xl" loading={submitting} size="lg">
          Se connecter
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <Link to="/forgot-password" className="text-sm text-accent hover:underline">
          Mot de passe oublié ?
        </Link>
        <p className="text-sm text-text-muted">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
