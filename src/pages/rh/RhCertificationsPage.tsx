import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useCollection } from '@/hooks/useCollection'
import type { AppUser, Certification, CertStatus } from '@/types'
import { computeCertStatus, daysUntilExpiry, formatDate } from '@/lib/utils'

export default function RhCertificationsPage() {
  const { data: certs } = useCollection<Certification>('certifications', [])
  const { data: users } = useCollection<AppUser & { id: string }>('users', [])
  const [statusFilter, setStatusFilter] = useState<CertStatus | 'all'>('all')

  const enriched = useMemo(() => {
    return certs.map((c) => {
      const status = computeCertStatus(c.expiryDate)
      const user = users.find((u) => (u.uid ?? u.id) === c.uid)
      return { ...c, status, userName: user?.fullName ?? c.uid, department: user?.department ?? '—' }
    })
  }, [certs, users])

  const filtered = enriched.filter((c) => statusFilter === 'all' || c.status === statusFilter)

  return (
    <>
      <Header title="Certifications" subtitle="Vue globale des certifications" />
      <div className="p-4 md:p-8 space-y-4">
        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CertStatus | 'all')}
        >
          <option value="all">Tous les statuts</option>
          <option value="valide">Valide</option>
          <option value="a_renouveler">À renouveler</option>
          <option value="expiree">Expirée</option>
        </select>

        <Card padding={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-text-muted">
                <th className="px-4 py-3">Technicien</th>
                <th className="px-4 py-3">Formation</th>
                <th className="px-4 py-3">Obtention</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const days = daysUntilExpiry(c.expiryDate)
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 ${
                      c.status === 'expiree' ? 'bg-danger-light/30' : c.status === 'a_renouveler' ? 'bg-warning-light/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.userName}</p>
                      <p className="text-xs text-text-muted">{c.department}</p>
                    </td>
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{formatDate(c.issueDate)}</td>
                    <td className="px-4 py-3">
                      {formatDate(c.expiryDate)}
                      {days >= 0 && days <= 60 && (
                        <span className="block text-xs text-warning">J-{days}</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      {c.pdfUrl?.url && (
                        <a href={c.pdfUrl.url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-6 text-sm text-text-muted">Aucune certification.</p>}
        </Card>
      </div>
    </>
  )
}
