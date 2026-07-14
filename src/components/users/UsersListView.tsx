import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Trash2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/PageLoader'
import { useCollection } from '@/hooks/useCollection'
import type { AppUser, UserRole, UserStatus } from '@/types'
import { ROLE_LABELS } from '@/types'
import { updateUserProfile, logAudit } from '@/lib/firestore'
import {
  filterUsersForViewer,
  userDetailPath,
  RH_VISIBLE_ROLES,
} from '@/lib/permissions'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { exportUsersExcel } from '@/lib/exports'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UsersListViewProps {
  title?: string
  subtitle?: string
}

export function UsersListView({
  title = 'Utilisateurs',
  subtitle = 'Gestion des comptes et validations',
}: UsersListViewProps) {
  const { profile } = useAuth()
  const { success } = useToast()
  const viewerRole = profile!.role
  const isAdmin = viewerRole === 'admin'

  const { data: allUsers, loading } = useCollection<AppUser & { id: string }>('users', [])
  const users = useMemo(
    () => filterUsersForViewer(viewerRole, allUsers),
    [allUsers, viewerRole],
  )

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  const roleOptions = isAdmin
    ? (['admin', 'rh', 'formateur', 'technicien'] as UserRole[])
    : RH_VISIBLE_ROLES

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const handleBulkValidate = async () => {
    for (const uid of selected) {
      await updateUserProfile(uid, { status: 'active' })
    }
    await logAudit(profile!.uid, 'VALIDATION_MASSE', 'bulk', `${selected.length} comptes validés`, profile!.fullName)
    success(`${selected.length} compte(s) validé(s)`)
    setSelected([])
  }

  const handleDelete = async () => {
    if (!deleteId || !isAdmin) return
    await deleteDoc(doc(db, 'users', deleteId))
    await logAudit(profile!.uid, 'SUPPRESSION', deleteId, 'Utilisateur supprimé', profile!.fullName)
    success('Utilisateur supprimé')
    setDeleteId(null)
  }

  return (
    <>
      <Header title={title} subtitle={subtitle} />
      <div className="p-4 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-1 gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200/80 rounded-xl bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2.5 text-sm border border-gray-200/80 rounded-xl bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            >
              <option value="all">Tous les rôles</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <select
              className="px-3 py-2.5 text-sm border border-gray-200/80 rounded-xl bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="incomplete">Profil incomplet</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button size="sm" onClick={handleBulkValidate} className="rounded-xl">
                Valider ({selected.length})
              </Button>
            )}
            <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => exportUsersExcel(users)}>
              Exporter Excel
            </Button>
          </div>
        </div>

        <Card padding={false}>
          {loading ? (
            <PageLoader title="Chargement des utilisateurs" />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="Aucun utilisateur" description="Aucun utilisateur ne correspond à vos filtres." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-text-muted bg-gray-50/50">
                    <th className="px-4 py-3 w-8">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          setSelected(e.target.checked ? filtered.map((u) => u.uid ?? u.id) : [])
                        }
                      />
                    </th>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Entreprise</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const uid = u.uid ?? u.id
                    return (
                      <motion.tr
                        key={uid}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-accent-light/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(uid)}
                            onChange={(e) =>
                              setSelected((s) =>
                                e.target.checked ? [...s, uid] : s.filter((id) => id !== uid),
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {u.fullName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{u.fullName}</p>
                              <p className="text-xs text-text-muted">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                        <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                        <td className="px-4 py-3">{u.company || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link to={userDetailPath(viewerRole, uid)}>
                              <Button size="sm" variant="secondary" className="rounded-lg">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {isAdmin && (
                              <button
                                onClick={() => setDeleteId(uid)}
                                className="p-2 hover:bg-danger-light rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-danger" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {isAdmin && (
        <ConfirmDialog
          open={!!deleteId}
          title="Supprimer l'utilisateur"
          message="Cette action est irréversible. Confirmer la suppression ?"
          confirmLabel="Supprimer"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  )
}
