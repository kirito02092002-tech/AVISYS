import { clsx } from 'clsx'

type BadgeStatus =
  | 'valide'
  | 'a_renouveler'
  | 'expiree'
  | 'active'
  | 'incomplete'
  | 'pending'
  | 'suspended'
  | 'admin'
  | 'rh'
  | 'formateur'
  | 'technicien'

const styles: Record<BadgeStatus, string> = {
  valide: 'bg-success-light text-success',
  a_renouveler: 'bg-warning-light text-warning',
  expiree: 'bg-danger-light text-danger',
  active: 'bg-success-light text-success',
  pending: 'bg-warning-light text-warning',
  incomplete: 'bg-orange-100 text-orange-700',
  suspended: 'bg-danger-light text-danger',
  admin: 'bg-purple-100 text-purple-700',
  rh: 'bg-blue-100 text-blue-700',
  formateur: 'bg-accent-light text-accent',
  technicien: 'bg-gray-100 text-gray-700',
}

const labels: Record<BadgeStatus, string> = {
  valide: 'Valide',
  a_renouveler: 'À renouveler',
  expiree: 'Expirée',
  active: 'Actif',
  pending: 'En attente',
  incomplete: 'Profil incomplet',
  suspended: 'Suspendu',
  admin: 'Admin',
  rh: 'RH',
  formateur: 'Formateur',
  technicien: 'Technicien',
}

interface StatusBadgeProps {
  status: BadgeStatus
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        styles[status],
      )}
    >
      {label ?? labels[status]}
    </span>
  )
}
