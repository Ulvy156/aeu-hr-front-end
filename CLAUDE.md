# HR Management System - Frontend AI Agent

## Important Reference Files

Before making changes, read these files first:

1. `.claude/FRONTEND_RULES.md`
2. `.claude/UI_GUIDELINES.md`
3. `.claude/PHASE_BREAKDOWN.md`
4. `/home/romyulvy/Documents/Personal/AEU/aeu-hr-back-end/.claude/API_CONTRACT.md`
If any file does not exist, stop and tell me which file is missing instead of guessing.
Follow these files when generating or editing frontend code.

## Commands

Package manager: `pnpm`.

- `pnpm dev` - start the Vite dev server
- `pnpm build` - type-check (`vue-tsc --build`) then production build
- `pnpm type-check` - run `vue-tsc --build` only
- `pnpm preview` - preview the production build
- `pnpm lint` - run `oxlint --fix` then `eslint --fix --cache`
- `pnpm format` - run `oxfmt` on `src/`

There is no test runner configured in this project.

## Purpose

You are working on the frontend of the HR Management System.

This frontend consumes APIs from the Laravel backend.

The frontend must not contain sensitive business logic.  
The backend is the single source of truth.

---

## Tech Stack

Use:

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- Element Plus
- Pinia
- Vue Router
- Axios
- Lucide for icon

---

## Main Rule

Do not generate backend code.

Only work inside the frontend project.

---

## Frontend Responsibilities

The frontend should handle:

- Page layout
- Form input
- API request/response handling
- UI validation
- Token storage
- Route protection
- Role-based menu display
- Table display
- Pagination UI
- Filter UI
- Upload UI
- Download button UI
- Error message display

---

## Frontend Must Not Calculate

Do not calculate sensitive business logic on frontend:

- Payroll
- Tax
- Net salary
- Leave balance
- Attendance status
- Late status
- Absent days
- GPS distance validation
- Salary proration
- Permission decision

The frontend can display values returned by backend.

---

## Required Workflow

For every frontend feature, follow this order:

1. Read API_CONTRACT.md
2. Create or update TypeScript types
3. Create service function in `src/services`
4. Create Pinia store if needed
5. Create page/component
6. Add route
7. Add menu item if needed
8. Add loading state
9. Add error handling
10. Test with backend API

---

## Coding Rules

- Use Composition API
- Use `<script setup lang="ts">`
- Use TypeScript interfaces
- Use reusable components where useful
- Keep pages clean
- Keep service logic outside components
- Keep Axios config inside `src/lib/axios.ts`
- Keep API request functions inside `src/services`
- Keep business logic in backend
- Do not hardcode API response fields
- Do not guess API endpoints
- Follow API_CONTRACT.md

---

## Security Rules

- Do not expose sensitive data in console logs
- Do not store password
- Do not store permission logic only in frontend
- Always rely on backend authorization
- Route guard is only for UI protection
- Backend must still protect every API
- Remove debug logs before final demo

---

## Architecture

### Feature module layout

Each module under `src/features/<name>/` follows the same shape:

```
features/<name>/
├── components/   # <Name>Page.vue, <Name>Table.vue, <Name>Filters.vue, <Name>FormDialog.vue
├── composables/  # use<Name>.ts - holds state, filters, pagination, load/save calls
├── services/     # <name>.api.ts - thin axios wrappers, one function per endpoint
├── types/        # <name>.ts - request/response interfaces incl. PaginationMeta
├── stores/       # only when module-level shared state is needed (e.g. auth)
└── views/        # <Name>View.vue - thin wrapper that renders the Page component
```

A typical CRUD module (see `src/features/departments/` as the reference example):
- `<Name>View.vue` just renders `<Name>Page.vue`.
- `<Name>Page.vue` owns the `use<Name>()` composable, opens dialogs, and wires up
  delete confirmations via `ElMessageBox.confirm` (never the browser `confirm()`).
- `use<Name>.ts` holds `reactive` filters (`search`, `status`, `page`, `per_page`),
  a `meta: PaginationMeta` ref, a `loading` ref, and exposes `loadX`, `applyFilters`,
  `onPageChange`, `onPageSizeChange`.
- `<name>.api.ts` returns the raw `{ success, message, data }` /
  `{ success, message, data, meta }` envelope from the backend - components/composables
  read `.data` / `.meta` from the result.
- Errors are surfaced with `useNotify().error(getApiErrorMessage(err))`
  (`src/utils/getApiErrorMessage.ts`); success actions use `useNotify().success(...)`.

### Cross-cutting pieces

- `src/lib/axios.ts` - shared axios instance. Reads the `access_token` cookie
  (`src/utils/cookie.ts`) and sets `Authorization: Bearer`. On `401` it clears the
  cookie and hard-redirects to `/login`.
- `src/router/index.ts` - all routes are declared here (no per-feature route files).
  Routes use `meta.requiresAuth` and `meta.permission`; `router.beforeEach` restores
  the user via `authStore.loadUser()` on first navigation, enforces auth, and checks
  `authStore.permissions` against `meta.permission`.
- `src/features/auth/stores/auth.store.ts` - the only Pinia store referenced app-wide;
  holds `user`, `token`, `permissions`, `roles`.
- `src/composables/usePermissions.ts` - `usePermission()` exposes `can`, `canAny`,
  `canAll`, `hasRole`, `hasAnyRole` for conditionally rendering actions/menu items.
- `src/composables/useNotify.ts` - wraps `ElMessage` for success/error/warning/info toasts.
- `src/components/common/` - shared building blocks: `PageHeader`, `AppCard`,
  `BaseButton`, `BaseInput`, `BaseModal`, `BasePagination`, `StatusBadge`, `EmptyState`,
  `LoadingState`, `ConfirmDialog`, `FormActions`, `DataTableWrapper`, `SearchFilterBar`
  - all re-exported from `src/components/common/index.ts`.
- `src/components/resuable/` - `SearchButton.vue`, `ResetButton.vue` used in filter bars.
- `src/layouts/` - `AuthLayout.vue` (login) and `DashboardLayout.vue` (sidebar + topbar
  shell, see `src/components/layout/AppSidebar.vue`).
- Path alias `@` -> `src/` (configured in `vite.config.ts` and the tsconfig files).
- Element Plus components are auto-imported via `unplugin-vue-components` /
  `unplugin-auto-import` - no need to manually import `el-*` components.
- `VITE_API_BASE_URL` (in `.env`) is the backend API base URL.

## Output Style

When editing code:

- Explain shortly what changed
- Mention files changed
- Do not over-explain
- Keep code clean and maintainable