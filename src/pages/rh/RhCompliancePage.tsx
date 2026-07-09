import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Download } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useCollection } from '@/hooks/useCollection'
import type { AppUser, Certification } from '@/types'
import { computeCertStatus } from '@/lib/utils'
import { exportComplianceExcel, exportCompliancePDF } from '@/lib/exports'

export default function RhCompliancePage() {
  const { data: users } = useCollection<AppUser & { id: string }>('users', [])
  const { data: certs } = useCollection<Certification>('certifications', [])
  const [deptFilter, setDeptFilter] = useState('all')

  const techniciens = users.filter((u) => u.role === 'technicien' && u.status === 'active')
  const departments = [...new Set(techniciens.map((t) => t.department || 'Non assigné'))]

  const rows = useMemo(() => {
    return techniciens
      .filter((t) => deptFilter === 'all' || t.department === deptFilter)
      .map((t) => {
        const uid = t.uid ?? t.id
        const userCerts = certs.map((c) => ({ ...c, status: computeCertStatus(c.expiryDate) })).filter((c) => c.uid === uid)
        const valide = userCerts.filter((c) => c.status === 'valide').length
        const aRenouveler = userCerts.filter((c) => c.status === 'a_renouveler').length
        const expiree = userCerts.filter((c) => c.status === 'expiree').length
        const total = userCerts.length || 1
        const rate = Math.round((valide / total) * 100)
        return { uid, name: t.fullName, department: t.department, valide, aRenouveler, expiree, rate }
      })
  }, [techniciens, certs, deptFilter])

  const globalRate = rows.length
    ? Math.round(rows.reduce((a, r) => a + r.rate, 0) / rows.length)
    : 0

  const exportRows = rows.map((r) => ({
    department: r.department,
    technician: r.name,
    valide: r.valide,
    aRenouveler: r.aRenouveler,
    expiree: r.expiree,
    complianceRate: r.rate,
  }))

  const gaugeColor = globalRate >= 90 ? 'text-success' : globalRate >= 70 ? 'text-warning' : 'text-danger'

  return (
    <>
      <Header title="Conformité" subtitle="Tableau de conformité global" />
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold ${gaugeColor}`}>{globalRate}%</div>
            <div>
              <p className="font-semibold">Taux de conformité global</p>
              <p className="text-sm text-text-muted">{rows.length} technicien(s) actif(s)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">Tous les départements</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Button variant="secondary" size="sm" onClick={() => exportCompliancePDF(exportRows, globalRate)}>
              <Download className="w-4 h-4" /> PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportComplianceExcel(exportRows)}>
              <Download className="w-4 h-4" /> Excel
            </Button>
          </div>
        </div>

        <Card padding={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-text-muted">
                <th className="px-4 py-3">Technicien</th>
                <th className="px-4 py-3">Département</th>
                <th className="px-4 py-3">Valides</th>
                <th className="px-4 py-3">À renouveler</th>
                <th className="px-4 py-3">Expirées</th>
                <th className="px-4 py-3">Conformité</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.uid}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 ${
                    r.expiree > 0 ? 'bg-danger-light/30' : r.aRenouveler > 0 ? 'bg-warning-light/30' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link to={`/rh/employees/${r.uid}`} className="font-medium text-accent hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.department}</td>
                  <td className="px-4 py-3"><StatusBadge status="valide" label={String(r.valide)} /></td>
                  <td className="px-4 py-3"><StatusBadge status="a_renouveler" label={String(r.aRenouveler)} /></td>
                  <td className="px-4 py-3"><StatusBadge status="expiree" label={String(r.expiree)} /></td>
                  <td className="px-4 py-3 font-semibold">{r.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="p-8 text-center">
              <Shield className="w-10 h-10 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">Aucune donnée de conformité.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
