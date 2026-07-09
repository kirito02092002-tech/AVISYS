import { useState } from 'react'
import { FileBarChart, Download } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { useCollection } from '@/hooks/useCollection'
import type { AppUser, Certification } from '@/types'
import { computeCertStatus } from '@/lib/utils'
import { exportComplianceExcel, exportCompliancePDF } from '@/lib/exports'

export default function RhReportsPage() {
  const { data: users } = useCollection<AppUser & { id: string }>('users', [])
  const { data: certs } = useCollection<Certification>('certifications', [])
  const [reportType, setReportType] = useState('global')

  const techniciens = users.filter((u) => u.role === 'technicien' && u.status === 'active')

  const rows = techniciens.map((t) => {
    const uid = t.uid ?? t.id
    const userCerts = certs.map((c) => ({ ...c, status: computeCertStatus(c.expiryDate) })).filter((c) => c.uid === uid)
    const valide = userCerts.filter((c) => c.status === 'valide').length
    const aRenouveler = userCerts.filter((c) => c.status === 'a_renouveler').length
    const expiree = userCerts.filter((c) => c.status === 'expiree').length
    const total = userCerts.length || 1
    return {
      department: t.department,
      technician: t.fullName,
      valide,
      aRenouveler,
      expiree,
      complianceRate: Math.round((valide / total) * 100),
    }
  })

  const globalRate = rows.length ? Math.round(rows.reduce((a, r) => a + r.complianceRate, 0) / rows.length) : 0

  const previewData = reportType === 'department'
    ? Object.entries(
        rows.reduce<Record<string, { count: number; rate: number }>>((acc, r) => {
          const d = r.department || 'Non assigné'
          if (!acc[d]) acc[d] = { count: 0, rate: 0 }
          acc[d].count++
          acc[d].rate += r.complianceRate
          return acc
        }, {}),
      ).map(([dept, { count, rate }]) => ({ label: dept, value: `${Math.round(rate / count)}%` }))
    : rows.slice(0, 5).map((r) => ({ label: r.technician, value: `${r.complianceRate}%` }))

  return (
    <>
      <Header title="Rapports" subtitle="Génération et export" />
      <div className="p-4 md:p-8 max-w-3xl space-y-6">
        <Card>
          <h3 className="font-semibold mb-4">Paramètres du rapport</h3>
          <Select
            label="Type de rapport"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'global', label: 'Conformité globale' },
              { value: 'department', label: 'Par département' },
              { value: 'individual', label: 'Historique individuel' },
            ]}
          />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FileBarChart className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Aperçu</h3>
          </div>
          <p className="text-sm text-text-muted mb-4">
            Taux global : <strong>{globalRate}%</strong> · {techniciens.length} technicien(s)
          </p>
          <div className="space-y-2">
            {previewData.map((item) => (
              <div key={item.label} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span>{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => exportCompliancePDF(rows, globalRate)}>
            <Download className="w-4 h-4" /> Exporter PDF
          </Button>
          <Button variant="secondary" onClick={() => exportComplianceExcel(rows)}>
            <Download className="w-4 h-4" /> Exporter Excel
          </Button>
        </div>
      </div>
    </>
  )
}
