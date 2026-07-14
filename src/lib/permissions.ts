import type { AppUser, UserRole } from '@/types'

/** Roles visible to RH in user management */
export const RH_VISIBLE_ROLES: UserRole[] = ['technicien', 'formateur', 'rh']

/** Roles RH can assign (never admin) */
export const RH_ASSIGNABLE_ROLES: UserRole[] = ['technicien', 'formateur', 'rh']

/** All roles admin can assign */
export const ADMIN_ASSIGNABLE_ROLES: UserRole[] = ['admin', 'rh', 'formateur', 'technicien']

export function canViewerSeeUser(viewerRole: UserRole, target: AppUser): boolean {
  if (viewerRole === 'admin') return true
  if (viewerRole === 'rh') return target.role !== 'admin'
  return false
}

export function canViewerAssignRole(viewerRole: UserRole, newRole: UserRole): boolean {
  if (viewerRole === 'admin') return true
  if (viewerRole === 'rh') return newRole !== 'admin'
  return false
}

export function getAssignableRoles(viewerRole: UserRole): UserRole[] {
  if (viewerRole === 'admin') return ADMIN_ASSIGNABLE_ROLES
  if (viewerRole === 'rh') return RH_ASSIGNABLE_ROLES
  return []
}

export function filterUsersForViewer(viewerRole: UserRole, users: AppUser[]): AppUser[] {
  if (viewerRole === 'admin') return users
  if (viewerRole === 'rh') return users.filter((u) => u.role !== 'admin')
  return []
}

export function usersListPath(viewerRole: UserRole): string {
  return viewerRole === 'admin' ? '/admin/users' : '/rh/users'
}

export function userDetailPath(viewerRole: UserRole, uid: string): string {
  return `${usersListPath(viewerRole)}/${uid}`
}
