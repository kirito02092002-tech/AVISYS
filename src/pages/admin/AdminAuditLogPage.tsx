import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/PageLoader'
import { useCollection } from '@/hooks/useCollection'
import type { AuditLog } from '@/types'
import { orderBy, limit } from 'firebase/firestore'
import { formatDateTime } from '@/lib/utils'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'

const ACTION_ICONS: Record<string, typeof Plus> = {
  INSCRIPTION: Plus,
  VALIDATION: Shield,
  CHANGEMENT_ROLE: Edit,
  SUPPRESSION: Trash2,
}

export default function AdminAuditLogPage() {
  const { data: logs, loading } = useCollection<AuditLog>('auditLogs', [
    orderBy('timestamp', 'desc'),
    limit(100),
  ])

  return (
    <>
      <Header title="Journal d'audit" subtitle="Historique des actions sensibles" />
      <div className="p-4 md:p-8">
        <Card padding={false}>
          {loading ? (
            <PageLoader title="Chargement de l'historique" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-text-muted">
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Détails</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const Icon = ACTION_ICONS[log.action] ?? Edit
                    return (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-accent" />
                            {log.action}
                          </div>
                        </td>
                        <td className="px-4 py-3">{log.userName ?? log.uid}</td>
                        <td className="px-4 py-3">{log.details}</td>
                        <td className="px-4 py-3 text-text-muted">{formatDateTime(log.timestamp)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
