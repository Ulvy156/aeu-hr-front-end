import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    permission?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/features/auth/views/LoginView.vue'),
          meta: { requiresAuth: false },
        },
      ],
    },

    // Dashboard routes
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/features/dashboard/views/DashboardView.vue'),
        },

        // Organization
        {
          path: 'departments',
          name: 'departments',
          component: () => import('@/features/departments/views/DepartmentsView.vue'),
          meta: { permission: 'departments.view' },
        },
        {
          path: 'positions',
          name: 'positions',
          component: () => import('@/features/positions/views/PositionsView.vue'),
          meta: { permission: 'positions.view' },
        },
        {
          path: 'employees',
          name: 'employees',
          component: () => import('@/features/employees/views/EmployeesView.vue'),
          meta: { permission: 'employees.view' },
        },
        {
          path: 'employee-promotion-requests',
          name: 'employee-promotion-requests',
          component: () => import('@/features/employee-upgrade-requests/views/UpgradeRequestsView.vue'),
          meta: { permission: 'employee_upgrade_requests.view' },
        },
        {
          path: 'org-chart',
          name: 'org-chart',
          component: () => import('@/features/employee-hierarchy/views/OrgChartView.vue'),
        },

        // Attendance
        {
          path: 'attendance',
          name: 'attendance',
          component: () => import('@/features/attendance/views/AttendanceView.vue'),
        },
        {
          path: 'attendance/correction',
          name: 'attendance-correction',
          component: () => import('@/features/attendance/views/AttendanceCorrectionView.vue'),
        },
        {
          path: 'attendance/proxy',
          name: 'attendance-proxy',
          component: () => import('@/features/attendance/views/AttendanceProxyView.vue'),
          meta: { permission: 'attendance.proxy_clock' },
        },
        {
          path: 'attendance/qr',
          name: 'attendance-qr',
          component: () => import('@/features/attendance/views/AttendanceQRView.vue'),
          meta: { permission: 'attendance.generate_qr' },
        },

        // Leave
        {
          path: 'leaves',
          name: 'leaves',
          component: () => import('@/features/leaves/views/LeavesView.vue'),
        },
        {
          path: 'leave-balances',
          name: 'leave-balances',
          component: () => import('@/features/leaves/views/LeaveBalancesView.vue'),
        },

        // Payroll
        {
          path: 'payrolls',
          name: 'payrolls',
          component: () => import('@/features/payroll/views/PayrollsView.vue'),
          meta: { permission: 'payrolls.view_any' },
        },
        {
          path: 'payrolls/:id',
          name: 'payroll-detail',
          component: () => import('@/features/payroll/views/PayrollDetailView.vue'),
          meta: { permission: 'payrolls.view_any' },
        },
        {
          path: 'payslips',
          name: 'payslips',
          component: () => import('@/features/payslips/views/PayslipsView.vue'),
          meta: { permission: 'payslips.view_own' },
        },

        // Communication
        {
          path: 'announcements',
          name: 'announcements',
          component: () => import('@/features/announcements/views/AnnouncementsView.vue'),
        },
        {
          path: 'announcements/categories',
          name: 'announcement-categories',
          component: () => import('@/features/announcements/views/AnnouncementCategoriesView.vue'),
          meta: { permission: 'announcement_categories.view' },
        },
        {
          path: 'announcements/create',
          name: 'announcement-create',
          component: () => import('@/features/announcements/views/AnnouncementFormView.vue'),
          meta: { permission: 'announcements.create' },
        },
        {
          path: 'announcements/:id/edit',
          name: 'announcement-edit',
          component: () => import('@/features/announcements/views/AnnouncementFormView.vue'),
          meta: { permission: 'announcements.update' },
        },

        // Recruitment
        {
          path: 'recruitment/vacancies',
          name: 'vacancies',
          component: () => import('@/features/recruitment/views/VacanciesView.vue'),
          meta: { permission: 'recruitment.vacancies.view' },
        },
        {
          path: 'recruitment/vacancies/:id',
          name: 'vacancy-detail',
          component: () => import('@/features/recruitment/views/VacancyDetailView.vue'),
          meta: { permission: 'recruitment.vacancies.view' },
        },
        {
          path: 'recruitment/candidates',
          name: 'candidates',
          component: () => import('@/features/recruitment/views/CandidatesView.vue'),
          meta: { permission: 'recruitment.candidates.view' },
        },
        {
          path: 'recruitment/candidates/create',
          name: 'candidate-create',
          component: () => import('@/features/recruitment/views/CandidateFormView.vue'),
          meta: { permission: 'recruitment.candidates.create' },
        },
        {
          path: 'recruitment/candidates/:id/edit',
          name: 'candidate-edit',
          component: () => import('@/features/recruitment/views/CandidateFormView.vue'),
          meta: { permission: 'recruitment.candidates.update' },
        },

        // Reports
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/features/reports/views/ReportsView.vue'),
          meta: { permission: 'reports.payroll_view' },
        },

        // Profile
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/features/profile/views/ProfileView.vue'),
        },

        // Admin
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/features/settings/views/SettingsView.vue'),
          meta: { permission: 'company_settings.view' },
        },
        {
          path: 'public-holidays',
          name: 'public-holidays',
          component: () => import('@/features/public-holidays/views/PublicHolidaysView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/features/users/views/UsersView.vue'),
          meta: { permission: 'users.view' },
        },
        {
          path: 'audit-logs',
          name: 'audit-logs',
          component: () => import('@/features/audit-logs/views/AuditLogsView.vue'),
          meta: { permission: 'audit_logs.view' },
        },
      ],
    },

    // QR scan — standalone page (no sidebar), requires auth
    {
      path: '/attendance/scan',
      name: 'attendance-scan',
      component: () => import('@/features/attendance/views/AttendanceQRScanView.vue'),
    },

    // Catch-all
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

let sessionRestored = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // On page refresh the in-memory access token is lost.
  // Try to restore the session via the httpOnly refresh-token cookie.
  if (!sessionRestored) {
    sessionRestored = true
    if (!authStore.isAuthenticated) {
      await authStore.restoreSession()
    }
  }

  // Root path — two layouts share path '/', so Vue Router may land on AuthLayout
  // with no child match (blank page). Handle it here directly after user is loaded.
  if (to.path === '/') {
    return authStore.isAuthenticated ? { name: 'dashboard' } : { name: 'login' }
  }

  // A route is public if any matched record explicitly sets requiresAuth: false
  const isPublicRoute = to.matched.some((r) => r.meta.requiresAuth === false)

  if (!isPublicRoute && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  // Permission guard
  const requiredPermission = to.meta.permission
  if (requiredPermission && authStore.isAuthenticated) {
    const allowed = authStore.permissions?.includes(requiredPermission) ?? false
    if (!allowed) {
      return router.hasRoute('forbidden') ? { name: 'forbidden' } : { name: 'dashboard' }
    }
  }
})

export default router
