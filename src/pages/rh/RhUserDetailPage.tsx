import { useParams } from 'react-router-dom'
import { UserDetailView } from '@/components/users/UserDetailView'

export default function RhUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <UserDetailView userId={id} />
}
