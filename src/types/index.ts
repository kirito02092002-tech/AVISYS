export type UserRole = 'admin' | 'rh' | 'formateur' | 'technicien'
export type UserStatus = 'incomplete' | 'pending' | 'active' | 'suspended'
export type CategoryType = 'reglementaire' | 'technique' | 'qualite' | 'interne'
export type CertStatus = 'valide' | 'a_renouveler' | 'expiree'
export type QuizType = 'intermediaire' | 'examen_final'

export interface CloudinaryFile {
  url: string
  publicId: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

export interface AppUser {
  uid: string
  id?: string
  email: string
  fullName: string
  role: UserRole
  status: UserStatus
  department: string
  employeeId: string
  company: string
  licenseNumber?: string
  phone?: string
  profileComplete?: boolean
  idDocumentUrl?: string
  idDocument?: CloudinaryFile
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  description: string
}

export interface Chapter {
  id: string
  title: string
  order: number
  videoUrl?: CloudinaryFile
  documentUrls: CloudinaryFile[]
}

export interface Training {
  id: string
  title: string
  description: string
  categoryId: string
  duration: number
  prerequisites: string[]
  assignedTo: string[]
  createdBy: string
  published: boolean
  coverUrl?: string
  chapters?: Chapter[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

export interface Quiz {
  id: string
  trainingId: string
  type: QuizType
  questions: QuizQuestion[]
  passingScore: number
}

export interface QuizAttempt {
  id: string
  uid: string
  quizId: string
  trainingId: string
  score: number
  answers: number[]
  attemptDate: string
  passed: boolean
}

export interface Certification {
  id: string
  uid: string
  trainingId: string
  name: string
  issueDate: string
  expiryDate: string
  authority: string
  status: CertStatus
  pdfUrl?: CloudinaryFile
}

export interface Progress {
  id: string
  uid: string
  trainingId: string
  completedChapters: string[]
  percentage: number
  lastAccessed: string
}

export interface ForumPost {
  id: string
  title: string
  content: string
  authorId: string
  authorName?: string
  category: string
  createdAt: string
  moderated: boolean
  commentCount?: number
}

export interface ForumComment {
  id: string
  content: string
  authorId: string
  authorName?: string
  createdAt: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  link: string
  invitedUids: string[]
  createdBy: string
}

export interface Notification {
  id: string
  uid: string
  type: 'certification' | 'formation' | 'reunion' | 'systeme'
  message: string
  read: boolean
  createdAt: string
  relatedCertId?: string
}

export interface AuditLog {
  id: string
  uid: string
  userName?: string
  action: string
  targetId: string
  timestamp: string
  details: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  rh: 'Responsable RH',
  formateur: 'Formateur',
  technicien: 'Technicien',
}

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  reglementaire: 'Réglementaire',
  technique: 'Technique',
  qualite: 'Qualité',
  interne: 'Interne',
}

export const CERT_STATUS_LABELS: Record<CertStatus, string> = {
  valide: 'Valide',
  a_renouveler: 'À renouveler',
  expiree: 'Expirée',
}

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  rh: '/rh/dashboard',
  formateur: '/formateur/dashboard',
  technicien: '/dashboard',
}

export function getPostLoginRoute(profile: AppUser): string {
  if (profile.status === 'incomplete') return '/complete-profile'
  if (profile.status === 'pending') return '/pending-approval'
  return DASHBOARD_ROUTES[profile.role]
}

export function canAccessPlatform(profile: AppUser): boolean {
  return profile.status === 'active'
}
