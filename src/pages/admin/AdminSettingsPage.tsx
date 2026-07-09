import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { ROLE_LABELS } from '@/types'
import type { UserRole } from '@/types'

const PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['Gestion utilisateurs', 'Validation comptes', 'Paramètres système', 'Journal d\'audit', 'Toutes les données'],
  rh: ['Tableau de bord RH', 'Conformité', 'Certifications', 'Rapports PDF/Excel', 'Historique techniciens'],
  formateur: ['Catégories', 'Formations', 'Quiz', 'Progression', 'Réunions', 'Modération forum'],
  technicien: ['Mes formations', 'Quiz', 'Certifications', 'Forum', 'Réunions', 'Notifications'],
}

export default function AdminSettingsPage() {
  return (
    <>
      <Header title="Paramètres" subtitle="Sécurité et permissions" />
      <div className="p-4 md:p-8 space-y-6 max-w-3xl">
        <Card>
          <h3 className="font-semibold mb-4">Sécurité</h3>
          <ul className="text-sm text-text-muted space-y-2">
            <li>• Authentification Firebase (email/mot de passe)</li>
            <li>• Mots de passe gérés par Firebase Auth — jamais stockés en clair</li>
            <li>• HTTPS via Vercel en production</li>
            <li>• Firestore Security Rules par rôle</li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Rôles & permissions</h3>
          <div className="space-y-4">
            {(Object.keys(PERMISSIONS) as UserRole[]).map((role) => (
              <div key={role} className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-medium text-primary">{ROLE_LABELS[role]}</h4>
                <ul className="mt-2 text-sm text-text-muted space-y-1">
                  {PERMISSIONS[role].map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
