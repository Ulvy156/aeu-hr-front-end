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

    // Catch-all
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

let userLoaded = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Restore user from cookie token on first navigation after page refresh
  if (!userLoaded && authStore.token && !authStore.user) {
    await authStore.loadUser()
    userLoaded = true
  }

  // A route is public if any matched record explicitly sets requiresAuth: false
  const isPublicRoute = to.matched.some((r) => r.meta.requiresAuth === false)

  if (!isPublicRoute && !authStore.isAuthenticated) {
    return { name: 'login' }
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
