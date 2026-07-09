import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import CompleteProfilePage from '@/pages/auth/CompleteProfilePage'
import PendingApprovalPage from '@/pages/auth/PendingApprovalPage'
import ProfilePage from '@/pages/shared/ProfilePage'
import NotificationsPage from '@/pages/shared/NotificationsPage'

import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage'
import AdminAuditLogPage from '@/pages/admin/AdminAuditLogPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

import FormateurDashboardPage from '@/pages/formateur/FormateurDashboardPage'
import FormateurCategoriesPage from '@/pages/formateur/FormateurCategoriesPage'
import FormateurTrainingsPage from '@/pages/formateur/FormateurTrainingsPage'
import FormateurTrainingEditPage from '@/pages/formateur/FormateurTrainingEditPage'
import FormateurQuizPage from '@/pages/formateur/FormateurQuizPage'
import FormateurProgressPage from '@/pages/formateur/FormateurProgressPage'
import FormateurMeetingsPage from '@/pages/formateur/FormateurMeetingsPage'
import FormateurForumPage from '@/pages/formateur/FormateurForumPage'

import RhDashboardPage from '@/pages/rh/RhDashboardPage'
import RhUsersPage from '@/pages/rh/RhUsersPage'
import RhUserDetailPage from '@/pages/rh/RhUserDetailPage'
import RhCompliancePage from '@/pages/rh/RhCompliancePage'
import RhCertificationsPage from '@/pages/rh/RhCertificationsPage'
import RhReportsPage from '@/pages/rh/RhReportsPage'
import RhEmployeeDetailPage from '@/pages/rh/RhEmployeeDetailPage'

import TechnicienDashboardPage from '@/pages/technicien/TechnicienDashboardPage'
import TechnicienTrainingsPage from '@/pages/technicien/TechnicienTrainingsPage'
import TechnicienTrainingDetailPage from '@/pages/technicien/TechnicienTrainingDetailPage'
import TechnicienQuizPage from '@/pages/technicien/TechnicienQuizPage'
import TechnicienCertificationsPage from '@/pages/technicien/TechnicienCertificationsPage'
import TechnicienForumPage from '@/pages/technicien/TechnicienForumPage'
import TechnicienForumDetailPage from '@/pages/technicien/TechnicienForumDetailPage'
import TechnicienMeetingsPage from '@/pages/technicien/TechnicienMeetingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<ProtectedRoute allowIncomplete />}>
              <Route path="/complete-profile" element={<CompleteProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute allowPending />}>
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
                  <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['formateur']} />}>
                  <Route path="/formateur/dashboard" element={<FormateurDashboardPage />} />
                  <Route path="/formateur/categories" element={<FormateurCategoriesPage />} />
                  <Route path="/formateur/trainings" element={<FormateurTrainingsPage />} />
                  <Route path="/formateur/trainings/:id/edit" element={<FormateurTrainingEditPage />} />
                  <Route path="/formateur/trainings/:id/quiz" element={<FormateurQuizPage />} />
                  <Route path="/formateur/trainings/:id/progress" element={<FormateurProgressPage />} />
                  <Route path="/formateur/meetings" element={<FormateurMeetingsPage />} />
                  <Route path="/formateur/forum" element={<FormateurForumPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['rh']} />}>
                  <Route path="/rh/dashboard" element={<RhDashboardPage />} />
                  <Route path="/rh/users" element={<RhUsersPage />} />
                  <Route path="/rh/users/:id" element={<RhUserDetailPage />} />
                  <Route path="/rh/compliance" element={<RhCompliancePage />} />
                  <Route path="/rh/certifications" element={<RhCertificationsPage />} />
                  <Route path="/rh/reports" element={<RhReportsPage />} />
                  <Route path="/rh/employees/:id" element={<RhEmployeeDetailPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['technicien']} />}>
                  <Route path="/dashboard" element={<TechnicienDashboardPage />} />
                  <Route path="/trainings" element={<TechnicienTrainingsPage />} />
                  <Route path="/trainings/:id" element={<TechnicienTrainingDetailPage />} />
                  <Route path="/trainings/:id/quiz" element={<TechnicienQuizPage />} />
                  <Route path="/certifications" element={<TechnicienCertificationsPage />} />
                  <Route path="/forum" element={<TechnicienForumPage />} />
                  <Route path="/forum/:id" element={<TechnicienForumDetailPage />} />
                  <Route path="/meetings" element={<TechnicienMeetingsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
