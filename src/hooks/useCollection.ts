import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, collectionName), ...constraints)
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(constraints.map(String))])

  return { data, loading, error }
}

export function useNotifications(uid: string | undefined) {
  return useCollection(
    'notifications',
    uid
      ? [where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(50)]
      : [],
  )
}

export function useUnreadCount(uid: string | undefined) {
  const { data } = useCollection<{ read: boolean }>(
    'notifications',
    uid ? [where('uid', '==', uid), where('read', '==', false)] : [],
  )
  return data.length
}
