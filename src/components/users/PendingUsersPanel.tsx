import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, X, Eye, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { AppUser, UserRole } from '@/types'
import { updateUserProfile, logAudit } from '@/lib/firestore'
import { filterUsersForViewer, userDetailPath } from '@/lib/permissions'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

interface PendingUsersPanelProps {
  users: AppUser[]
  limit?: number
}

export function PendingUsersPanel({ users, limit = 5 }: PendingUsersPanelProps) {
  const { profile } = useAuth()
  const { success, error: toastError } = useToast()
  const viewerRole = profile!.role as UserRole

  const visible = filterUsersForViewer(viewerRole, users)
  const pending = visible.filter((u) => u.status === 'pending').slice(0, limit)

  const handleValidate = async (uid: string, name: string, approve: boolean) => {
    try {
      await updateUserProfile(uid, { status: approve ? 'active' : 'suspended' })
      await logAudit(
        profile!.uid,
        approve ? 'VALIDATION' : 'REFUS',
        uid,
        `Compte ${approve ? 'validé' : 'refusé'}`,
        profile!.fullName,
      )
      success(approve ? `${name} validé` : `${name} refusé`)
    } catch {
      toastError('Erreur lors de la validation')
    }
  }

  return (
    <Card className="border-l-4 border-l-warning">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-warning" />
        <h3 className="font-semibold">Comptes en attente de validation</h3>
        {pending.length > 0 && (
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-warning-light text-warning">
            {pending.length}
          </span>
        )}
      </div>
      {pending.length === 0 ? (
        <p className="text-sm text-text-muted">Aucune demande en attente.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((u) => {
            const uid = u.uid ?? (u as AppUser & { id: string }).id
            return (
              <motion.div
                key={uid}
                layout
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-accent/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-semibold text-sm">
                    {u.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{u.fullName}</p>
                    <p className="text-xs text-text-muted">{u.company || u.email}</p>
                    <StatusBadge status={u.role} />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={userDetailPath(viewerRole, uid)}>
                    <Button size="sm" variant="secondary" className="rounded-xl">
                      <Eye className="w-4 h-4" /> Voir profil
                    </Button>
                  </Link>
                  <Button size="sm" className="rounded-xl" onClick={() => handleValidate(uid, u.fullName, true)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" className="rounded-xl" onClick={() => handleValidate(uid, u.fullName, false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
