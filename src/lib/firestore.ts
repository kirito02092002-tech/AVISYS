import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppUser, UserRole } from '@/types'
import { stripUndefined } from './errors'

export async function createUserProfile(
  uid: string,
  data: Omit<AppUser, 'uid' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const now = new Date().toISOString()
  await setDoc(
    doc(db, 'users', uid),
    stripUndefined({
      ...data,
      createdAt: now,
      updatedAt: now,
    }),
  )
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { uid, ...snap.data() } as AppUser
}

export async function updateUserProfile(
  uid: string,
  data: Partial<AppUser>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function logAudit(
  uid: string,
  action: string,
  targetId: string,
  details: string,
  userName?: string,
): Promise<void> {
  await addDoc(collection(db, 'auditLogs'), {
    uid,
    userName,
    action,
    targetId,
    details,
    timestamp: new Date().toISOString(),
  })
}

export async function createNotification(
  uid: string,
  type: 'certification' | 'formation' | 'reunion' | 'systeme',
  message: string,
  relatedCertId?: string,
): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    uid,
    type,
    message,
    read: false,
    relatedCertId: relatedCertId ?? null,
    createdAt: new Date().toISOString(),
  })
}

export async function seedAdminIfNeeded(
  uid: string,
  email: string,
  fullName: string,
): Promise<void> {
  const existing = await getUserProfile(uid)
  if (existing) return

  await createUserProfile(uid, {
    email,
    fullName,
    role: 'admin' as UserRole,
    status: 'active',
    department: 'Administration',
    employeeId: 'ADMIN-001',
    company: 'AVISYS',
  })
}
