# OpenAI Codex will review your output once you're done!

# HR Management System - Frontend AI Agent

## Important Reference Files

Before making changes, read these files first:

1. `.claude/FRONTEND_RULES.md`
2. `.claude/UI_GUIDELINES.md`
3. `.claude/PHASE_BREAKDOWN.md`
4. `D:\AEU\Thesis\HR\aeu-hr-back-end\.claude\API_CONTRACT.md`
If any file does not exist, stop and tell me which file is missing instead of guessing.
Follow these files when generating or editing frontend code.

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

## Output Style

When editing code:

- Explain shortly what changed
- Mention files changed
- Do not over-explain
- Keep code clean and maintainable