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

### Reusable code rule:

Before creating any new component, composable, helper, utility, type, or service, first check if an existing reusable one already exists in the project.

Reuse existing shared code when possible, especially from:
- src/components/common
- src/composables
- src/utils
- src/lib
- src/types
- existing feature folders

Examples:
- Reuse existing PageHeader, AppCard, DataTableWrapper, StatusBadge, EmptyState, LoadingState, ConfirmDialog, FormActions, or SearchFilterBar if they already exist.
- Reuse existing useApiError, usePagination, usePermission, axios instance, date formatters, and constants if available.
- Reuse existing API response/pagination types if already defined.

If a reusable helper/component does not exist:
- Create it only when it will likely be reused across multiple features.
- Place shared reusable code in the correct shared folder:
  - components used across modules → src/components/common
  - composables used across modules → src/composables
  - helpers/utils used across modules → src/utils
  - global/shared types → src/types

If it is only needed for attendance:
- Keep it scoped inside:
  - src/features/attendance/components
  - src/features/attendance/composables
  - src/features/attendance/services
  - src/features/attendance/types

For the geolocation helper:
- First check if a location/geolocation helper already exists.
- If it exists, reuse it.
- If it does not exist and only attendance uses it for now, create it as:
  src/features/attendance/utils/getCurrentLocation.ts
- If another feature already needs browser location too, create it as:
  src/utils/getCurrentLocation.ts

Do not duplicate similar helpers/components with different names.
Do not rewrite existing reusable logic unless it is broken.
Keep naming consistent with the current project.

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