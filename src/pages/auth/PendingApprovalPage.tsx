import { motion } from 'framer-motion'
import { Clock, LogOut, Mail, Building2, Phone } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow'
import { getPostLoginRoute } from '@/types'

export default function PendingApprovalPage() {
  const { profile, logout, loading } = useAuth()

  if (!loading && profile && profile.status === 'active') {
    return <Navigate to={getPostLoginRoute(profile)} replace />
  }

  if (!loading && profile?.status === 'incomplete') {
    return <Navigate to="/complete-profile" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-accent-light/30 to-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-warning-light to-warning/20 flex items-center justify-center mx-auto mb-6"
        >
          <Clock className="w-10 h-10 text-warning" />
        </motion.div>

        <h1 className="text-xl font-bold text-center text-text">
          Dossier en cours de validation
        </h1>
        <p className="text-sm text-text-muted text-center mt-3">
          Merci {profile?.fullName} ! Votre dossier a été transmis. Un administrateur va l'examiner,
          valider votre compte et vous attribuer le rôle approprié.
        </p>

        {profile && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-text-muted uppercase mb-2">Récapitulatif</p>
            <InfoRow label="Email" value={profile.email} icon={<Mail className="w-4 h-4" />} />
            <InfoRow label="Entreprise" value={profile.company} icon={<Building2 className="w-4 h-4" />} />
            <InfoRow label="Téléphone" value={profile.phone} icon={<Phone className="w-4 h-4" />} />
          </div>
        )}

        <p className="text-xs text-text-muted text-center mt-4">
          Vous n'avez pas encore accès aux formations tant que votre compte n'est pas validé.
        </p>

        <Button variant="secondary" className="w-full mt-6 rounded-xl" onClick={() => logout()}>
          <LogOut className="w-4 h-4" /> Se déconnecter
        </Button>
      </motion.div>
    </div>
  )
}
