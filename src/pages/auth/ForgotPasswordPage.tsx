import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Réinitialisez votre accès AVISYS">
      {sent ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-muted text-center"
        >
          Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
        </motion.p>
      ) : (
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
          <Button type="submit" className="w-full rounded-xl" loading={loading} size="lg">
            Envoyer le lien
          </Button>
        </form>
      )}
      <Link to="/login" className="block text-center text-sm text-accent mt-6 hover:underline font-medium">
        Retour à la connexion
      </Link>
    </AuthLayout>
  )
}
