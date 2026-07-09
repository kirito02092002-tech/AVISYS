import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import type { AppUser, Certification, Training } from '@/types'
import { formatDate } from './utils'

export function generateCertificatePDF(
  user: AppUser,
  training: Training,
  cert: Certification,
): Blob {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(15, 42, 74)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.text('AVISYS', pageWidth / 2, 18, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Certification de formation aéronautique', pageWidth / 2, 30, { align: 'center' })

  doc.setTextColor(30, 37, 48)
  doc.setFontSize(14)
  doc.text('Ce certificat atteste que', pageWidth / 2, 60, { align: 'center' })

  doc.setFontSize(24)
  doc.setTextColor(15, 42, 74)
  doc.text(user.fullName, pageWidth / 2, 75, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(30, 37, 48)
  doc.text('a complété avec succès la formation', pageWidth / 2, 90, { align: 'center' })

  doc.setFontSize(20)
  doc.setTextColor(46, 156, 219)
  doc.text(training.title, pageWidth / 2, 105, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(138, 148, 166)
  doc.text(`Délivré le ${formatDate(cert.issueDate)}`, pageWidth / 2, 125, { align: 'center' })
  doc.text(`Valide jusqu'au ${formatDate(cert.expiryDate)}`, pageWidth / 2, 133, { align: 'center' })
  doc.text(`Autorité : ${cert.authority}`, pageWidth / 2, 141, { align: 'center' })

  doc.setDrawColor(46, 156, 219)
  doc.setLineWidth(0.5)
  doc.rect(15, 45, pageWidth - 30, 120)

  return doc.output('blob')
}

interface ComplianceRow {
  department: string
  technician: string
  valide: number
  aRenouveler: number
  expiree: number
  complianceRate: number
}

export function exportComplianceExcel(rows: ComplianceRow[], filename = 'conformite-avisys'): void {
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      Département: r.department,
      Technicien: r.technician,
      'Certifications valides': r.valide,
      'À renouveler': r.aRenouveler,
      Expirées: r.expiree,
      'Taux de conformité (%)': r.complianceRate,
    })),
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Conformité')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportCompliancePDF(rows: ComplianceRow[], globalRate: number): void {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.setTextColor(15, 42, 74)
  doc.text('Rapport de conformité AVISYS', 14, 20)
  doc.setFontSize(11)
  doc.setTextColor(30, 37, 48)
  doc.text(`Taux global : ${globalRate}%`, 14, 30)
  doc.text(`Généré le ${formatDate(new Date().toISOString())}`, 14, 38)

  let y = 50
  rows.slice(0, 25).forEach((row) => {
    doc.setFontSize(10)
    doc.text(`${row.technician} (${row.department}) — ${row.complianceRate}%`, 14, y)
    y += 7
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  })

  doc.save('rapport-conformite-avisys.pdf')
}

export function exportUsersExcel(users: AppUser[]): void {
  const ws = XLSX.utils.json_to_sheet(
    users.map((u) => ({
      Nom: u.fullName,
      Email: u.email,
      Rôle: u.role,
      Statut: u.status,
      Entreprise: u.company,
      Matricule: u.employeeId,
      Département: u.department,
    })),
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs')
  XLSX.writeFile(wb, 'utilisateurs-avisys.xlsx')
}
