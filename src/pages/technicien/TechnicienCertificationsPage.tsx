import { useMemo, useState } from 'react'
import { Download, Award } from 'lucide-react'
import { where } from 'firebase/firestore'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { useCollection } from '@/hooks/useCollection'
import type { Certification, CertStatus } from '@/types'
import { computeCertStatus, formatDate } from '@/lib/utils'

export default function TechnicienCertificationsPage() {
  const { profile } = useAuth()
  const { data: certs } = useCollection<Certification>('certifications', [
    where('uid', '==', profile?.uid ?? ''),
  ])
  const [statusFilter, setStatusFilter] = useState<CertStatus | 'all'>('all')

  const enriched = useMemo(
    () => certs.map((c) => ({ ...c, status: computeCertStatus(c.expiryDate) })),
    [certs],
  )

  const filtered = enriched.filter((c) => statusFilter === 'all' || c.status === statusFilter)
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
  )

  return (
    <>
      <Header title="Mes certifications" subtitle="Certificats et validité" />
      <div className="p-4 md:p-8">
        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg mb-6"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CertStatus | 'all')}
        >
          <option value="all">Tous</option>
          <option value="valide">Valide</option>
          <option value="a_renouveler">À renouveler</option>
          <option value="expiree">Expirée</option>
        </select>

        {sorted.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Aucune certification"
            description="Passez un examen final pour obtenir votre première certification."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((c) => (
              <Card key={c.id} className="relative border-2 border-gray-100">
                <div className="absolute top-4 right-4">
                  <StatusBadge status={c.status} />
                </div>
                <div className="border-b-2 border-primary/20 pb-4 mb-4">
                  <Award className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold pr-20">{c.name}</h3>
                </div>
                <div className="text-sm space-y-1 text-text-muted">
                  <p>Délivré le {formatDate(c.issueDate)}</p>
                  <p>Expire le {formatDate(c.expiryDate)}</p>
                  <p className="text-xs">{c.authority}</p>
                </div>
                {c.pdfUrl?.url && (
                  <a href={c.pdfUrl.url} target="_blank" rel="noreferrer" className="inline-block mt-4">
                    <Button size="sm" variant="secondary">
                      <Download className="w-4 h-4" /> Télécharger PDF
                    </Button>
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
