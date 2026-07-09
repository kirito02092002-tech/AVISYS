import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUserProfile, getUserProfile, logAudit, updateUserProfile } from '@/lib/firestore'
import type { AppUser, CloudinaryFile } from '@/types'

interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface CompleteProfileData {
  employeeId: string
  company: string
  department: string
  licenseNumber?: string
  idDocument: CloudinaryFile
}

interface AuthContextValue {
  user: User | null
  profile: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  completeProfile: (data: CompleteProfileData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const p = await getUserProfile(user.uid)
    setProfile(p)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (data: RegisterData) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password)
    try {
      await createUserProfile(cred.user.uid, {
        email: data.email,
        fullName: data.fullName,
        role: 'technicien',
        status: 'incomplete',
        profileComplete: false,
        department: '',
        employeeId: '',
        company: '',
        ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
      })
      try {
        await logAudit(cred.user.uid, 'INSCRIPTION', cred.user.uid, 'Nouveau compte créé', data.fullName)
      } catch {
        // non bloquant
      }
    } catch (error) {
      try {
        await deleteUser(cred.user)
      } catch {
        // ignore
      }
      throw error
    }
  }

  const completeProfile = async (data: CompleteProfileData) => {
    if (!user) throw new Error('Non connecté')
    await updateUserProfile(user.uid, {
      employeeId: data.employeeId,
      company: data.company,
      department: data.department,
      ...(data.licenseNumber?.trim() ? { licenseNumber: data.licenseNumber.trim() } : {}),
      idDocumentUrl: data.idDocument.url,
      idDocument: data.idDocument,
      profileComplete: true,
      status: 'pending',
    })
    const p = await getUserProfile(user.uid)
    setProfile(p)
    try {
      await logAudit(user.uid, 'PROFIL_COMPLETE', user.uid, 'Dossier soumis pour validation', p?.fullName)
    } catch {
      // non bloquant
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        completeProfile,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
