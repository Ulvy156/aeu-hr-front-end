# Frontend Rules

## Important:
- Only work inside the frontend project.
- Do not create backend code.
- Do not guess API endpoints.
- Follow existing project structure and naming.
- Use Vue 3 Composition API with <script setup lang="ts">.
- Use TypeScript, Tailwind CSS, and Element Plus.
- Keep components clean, simple, reusable, and easy to maintain.

## Global File Size Rule

Keep each file under 300 lines when possible.

If a file grows above 300 lines, refactor it into smaller readable files.

Recommended split pattern:

- Vue page → split into page, form, table, filter, dialog/modal components
- API logic → keep in `src/services`
- Types/interfaces → keep in `src/types`
- Reusable logic → keep in `src/composables`
- Constants/options → keep in `src/constants`
- Helper functions → keep in `src/utils`

Do not force unnecessary splitting if keeping the file as one file is clearer and easier to maintain.

## Project Direction

This frontend is for the HR Management System.

The backend is Laravel API.

The frontend should only consume backend APIs and display data.

---

## Folder Structure

Recommended structure:

src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginPage.vue
│   │   │   └── ...
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── LoginView.vue
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── DashboardPage.vue
│   │   │   └── ...
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── DashboardView.vue
│   │
│   ├── departments/
│   │   ├── components/
│   │   │   ├── DepartmentsPage.vue
│   │   │   ├── DepartmentForm.vue
│   │   │   ├── DepartmentTable.vue
│   │   │   ├── DepartmentFilters.vue
│   │   │   └── DepartmentDialog.vue
│   │   ├── composables/
│   │   │   └── useDepartments.ts
│   │   ├── services/
│   │   │   └── department.api.ts
│   │   ├── stores/
│   │   ├── types/
│   │   │   └── department.ts
│   │   └── views/
│   │       └── DepartmentsView.vue
│   │
│   ├── positions/
│   │   ├── components/
│   │   │   └── PositionsPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── PositionsView.vue
│   │
│   ├── employees/
│   │   ├── components/
│   │   │   └── EmployeesPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── EmployeesView.vue
│   │
│   ├── attendance/
│   │   ├── components/
│   │   │   └── AttendancePage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── AttendanceView.vue
│   │
│   ├── leaves/
│   │   ├── components/
│   │   │   └── LeavesPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── LeavesView.vue
│   │
│   ├── payroll/
│   │   ├── components/
│   │   │   └── PayrollPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── PayrollView.vue
│   │
│   ├── payslips/
│   │   ├── components/
│   │   │   └── PayslipsPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── PayslipsView.vue
│   │
│   ├── reports/
│   │   ├── components/
│   │   │   └── ReportsPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── ReportsView.vue
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   └── CompanySettingsPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── CompanySettingsView.vue
│   │
│   ├── public-holidays/
│   │   ├── components/
│   │   │   └── PublicHolidaysPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── PublicHolidaysView.vue
│   │
│   ├── users/
│   │   ├── components/
│   │   │   └── UsersPage.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── views/
│   │       └── UsersView.vue
│   │
│   └── audit-logs/
│       ├── components/
│       │   └── AuditLogsPage.vue
│       ├── composables/
│       ├── services/
│       ├── stores/
│       ├── types/
│       └── views/
│           └── AuditLogsView.vue
│
├── components/
│   ├── common/
│   └── layout/
│
├── composables/
│   ├── useApiError.ts
│   ├── usePagination.ts
│   └── usePermission.ts
│
├── layouts/
│   ├── AuthLayout.vue
│   └── DashboardLayout.vue
│
├── lib/
│   └── axios.ts
│
├── router/
│   ├── index.ts
│   └── guards.ts
│
├── stores/
│   └── app-level stores only
│
├── types/
│   └── shared global types only
│
├── utils/
│   ├── cookie.ts
│   ├── formatDate.ts
│   ├── formatMoney.ts
│   └── constants.ts
│
├── assets/
├── App.vue
└── main.ts