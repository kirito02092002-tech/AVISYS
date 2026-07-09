import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { AnimatePresence } from 'framer-motion'
import {
  Mail, Phone, Building2, Hash, Award, Briefcase, Check, X, User, ArrowLeft, ShieldOff,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Select } from '@/components/ui/Input'
import { InfoRow } from '@/components/ui/InfoRow'
import { PageLoader } from '@/components/ui/PageLoader'
import { db } from '@/lib/firebase'
import type { AppUser, UserRole } from '@/types'
import { ROLE_LABELS } from '@/types'
import { updateUserProfile, logAudit } from '@/lib/firestore'
import {
  canViewerSeeUser,
  canViewerAssignRole,
  getAssignableRoles,
  usersListPath,
} from '@/lib/permissions'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

interface UserDetailViewProps {
  userId: string
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const { profile: viewer } = useAuth()
  const { success, error: toastError } = useToast()
  const [user, setUser] = useState<AppUser | null>(null)
  const [role, setRole] = useState<UserRole>('technicien')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  const viewerRole = viewer!.role
  const isAdmin = viewerRole === 'admin'
  const assignableRoles = getAssignableRoles(viewerRole)
  const listPath = usersListPath(viewerRole)

  useEffect(() => {
    if (!userId) return
    getDoc(doc(db, 'users', userId)).then((snap) => {
      if (!snap.exists()) return
      const data = { uid: snap.id, ...snap.data() } as AppUser
      if (!canViewerSeeUser(viewerRole, data)) {
        setDenied(true)
        return
      }
      setUser(data)
      setRole(data.role)
    })
  }, [userId, viewerRole])

  const handleUpdateRole = async () => {
    if (!userId || !user || !viewer) return
    if (!canViewerAssignRole(viewerRole, role)) {
      toastError('Vous ne pouvez pas attribuer ce rôle.')
      return
    }
    setLoading(true)
    try {
      await updateUserProfile(userId, { role })
      await logAudit(viewer.uid, 'CHANGEMENT_ROLE', userId, `Rôle changé en ${role}`, viewer.fullName)
      setUser({ ...user, role })
      setSaved(true)
      success(`Rôle mis à jour : ${ROLE_LABELS[role]}`)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toastError('Erreur lors du changement de rôle')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approve: boolean) => {
    if (!userId || !user || !viewer) return
    setLoading(true)
    try {
      const newStatus = approve ? 'active' : 'suspended'
      await updateUserProfile(userId, { status: newStatus })
      await logAudit(
        viewer.uid,
        approve ? 'VALIDATION' : 'REFUS',
        userId,
        `Compte ${approve ? 'validé' : 'refusé'}`,
        viewer.fullName,
      )
      setUser({ ...user, status: newStatus })
      success(approve ? 'Compte validé avec succès' : 'Compte refusé')
    } catch {
      toastError('Erreur lors de la validation')
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!userId || !user) return
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended'
    await updateUserProfile(userId, { status: newStatus })
    setUser({ ...user, status: newStatus })
    success(newStatus === 'suspended' ? 'Compte suspendu' : 'Compte réactivé')
  }

  if (denied) {
    return (
      <>
        <Header title="Accès refusé" />
        <div className="p-8 flex flex-col items-center gap-4">
          <ShieldOff className="w-12 h-12 text-text-muted" />
          <p className="text-text-muted">Vous n'avez pas accès à ce profil.</p>
          <Link to={listPath}><Button variant="secondary">Retour à la liste</Button></Link>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header title="Fiche utilisateur" />
        <PageLoader title="Chargement du profil" />
      </>
    )
  }

  return (
    <>
      <Header title={user.fullName} subtitle="Fiche utilisateur détaillée" />
      <div className="p-4 md:p-8 space-y-6 max-w-4xl">
        <Link
          to={listPath}
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux utilisateurs
        </Link>

        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-success" />
          <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-3xl font-bold shadow-lg"
            >
              {user.fullName.charAt(0)}
            </motion.div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge status={user.role} />
                <StatusBadge status={user.status} />
                {user.profileComplete && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-success-light text-success font-medium">
                    Dossier complet
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => handleApprove(true)} loading={loading}>
                    <Check className="w-4 h-4" /> Valider
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleApprove(false)} loading={loading}>
                    <X className="w-4 h-4" /> Refuser
                  </Button>
                </>
              )}
              <Button variant="secondary" size="sm" onClick={handleSuspend}>
                {user.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            Informations personnelles
          </h3>
          <InfoRow label="Nom complet" value={user.fullName} />
          <InfoRow label="Email" value={user.email} icon={<Mail className="w-4 h-4" />} />
          <InfoRow label="Téléphone" value={user.phone} icon={<Phone className="w-4 h-4" />} />
        </Card>

        <Card>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent" />
            Informations professionnelles
          </h3>
          <InfoRow label="Matricule" value={user.employeeId} icon={<Hash className="w-4 h-4" />} />
          <InfoRow label="Entreprise / Société" value={user.company} icon={<Building2 className="w-4 h-4" />} />
          <InfoRow label="Département" value={user.department} />
          <InfoRow label="N° de licence" value={user.licenseNumber} icon={<Award className="w-4 h-4" />} />
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Modifier le rôle</h3>
          <p className="text-sm text-text-muted mb-4">
            {isAdmin
              ? 'Attribuez le rôle adapté : technicien, RH, formateur ou administrateur.'
              : 'Attribuez le rôle adapté : technicien, RH ou formateur. Seul un administrateur peut créer un admin.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Select
                label="Rôle"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                options={assignableRoles.map((r) => ({
                  value: r,
                  label: ROLE_LABELS[r],
                }))}
              />
            </div>
            <Button
              onClick={handleUpdateRole}
              loading={loading}
              disabled={!canViewerAssignRole(viewerRole, role)}
              className="relative overflow-hidden rounded-xl"
            >
              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-success flex items-center justify-center gap-2 text-white"
                  >
                    <Check className="w-4 h-4" /> Enregistré !
                  </motion.span>
                )}
              </AnimatePresence>
              <span className={saved ? 'opacity-0' : ''}>Enregistrer</span>
            </Button>
          </div>
        </Card>

        {user.idDocumentUrl && (
          <Card>
            <h3 className="font-semibold mb-4">Justificatif / Badge</h3>
            <motion.img
              whileHover={{ scale: 1.02 }}
              src={user.idDocumentUrl}
              alt="Badge"
              className="max-w-sm rounded-xl border border-gray-200 cursor-pointer shadow-md hover:shadow-lg transition-shadow"
              onClick={() => window.open(user.idDocumentUrl, '_blank')}
            />
            <p className="text-xs text-text-muted mt-2">Cliquez pour agrandir</p>
          </Card>
        )}
      </div>
    </>
  )
}
