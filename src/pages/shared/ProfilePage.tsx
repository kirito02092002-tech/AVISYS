import { Header } from '@/components/layout/Header'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { InfoRow } from '@/components/ui/InfoRow'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Mail, Phone, Building2, Hash, Award, Briefcase } from 'lucide-react'

export default function ProfilePage() {
  const { profile } = useAuth()

  if (!profile) return null

  return (
    <>
      <Header title="Mon profil" subtitle="Informations personnelles" />
      <div className="p-4 md:p-8 max-w-2xl">
        <Card>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-2xl font-bold">
              {profile.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile.fullName}</h2>
              <div className="flex gap-2 mt-1">
                <StatusBadge status={profile.role} />
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </div>
          <InfoRow label="Email" value={profile.email} icon={<Mail className="w-4 h-4" />} />
          <InfoRow label="Téléphone" value={profile.phone} icon={<Phone className="w-4 h-4" />} />
          <InfoRow label="Matricule" value={profile.employeeId} icon={<Hash className="w-4 h-4" />} />
          <InfoRow label="Entreprise" value={profile.company} icon={<Building2 className="w-4 h-4" />} />
          <InfoRow label="Département" value={profile.department} icon={<Briefcase className="w-4 h-4" />} />
          <InfoRow label="N° de licence" value={profile.licenseNumber} icon={<Award className="w-4 h-4" />} />
          <p className="text-xs text-text-muted mt-4">
            Pour modifier ces informations, contactez un administrateur.
          </p>
        </Card>
      </div>
    </>
  )
}
