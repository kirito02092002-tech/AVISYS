import type { CertStatus } from '@/types'

export function computeCertStatus(expiryDate: string): CertStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expiree'
  if (diffDays <= 60) return 'a_renouveler'
  return 'valide'
}

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export const ALERT_THRESHOLDS = [90, 60, 30, 15, 7, 0] as const

export function shouldSendAlert(daysRemaining: number): boolean {
  return ALERT_THRESHOLDS.includes(daysRemaining as (typeof ALERT_THRESHOLDS)[number])
}

export function computeProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function formatRelativeDate(dateInput: unknown): string {
  const date = toDate(dateInput)
  if (!date || isNaN(date.getTime())) return '—'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR')
}

export function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate()
    }
    if ('seconds' in value) {
      return new Date((value as { seconds: number }).seconds * 1000)
    }
  }
  return null
}

export function formatDate(dateInput: unknown): string {
  const date = toDate(dateInput)
  if (!date || isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(dateInput: unknown): string {
  const date = toDate(dateInput)
  if (!date || isNaN(date.getTime())) return '—'
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getCloudinaryDownloadUrl(url: string): string {
  // Add fl_attachment transformation to force browser download for Cloudinary files
  if (!url.includes('cloudinary.com')) return url
  if (url.includes('/fl_attachment/')) return url
  return url.replace('/upload/', '/upload/fl_attachment/')
}

export async function downloadFile(url: string, fileName: string): Promise<void> {
  const downloadUrl = getCloudinaryDownloadUrl(url)

  try {
    const response = await fetch(downloadUrl, { method: 'GET', mode: 'cors' })
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'Accès au fichier refusé (Cloudinary). Vérifiez dans Cloudinary : Settings → Security → désactivez "Restricted media assets" pour les documents.',
      )
    }
    if (!response.ok) throw new Error('Téléchargement échoué')
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    // If CORS/fetch fails but file might be public, try opening the attachment URL
    if (error instanceof Error && error.message.includes('Cloudinary')) {
      throw error
    }
    window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    throw error instanceof Error ? error : new Error('Téléchargement échoué')
  }
}
