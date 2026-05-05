Build the frontend for Phase 5: Payroll and Payslip module for the HR Management System.

Context:

- Backend is already implemented.
- Do not change backend API structure.
- Do not generate backend code.
- Use the backend as the single source of truth for payroll calculations, deductions, tax, approval status, locking, and payslip visibility.
- Read and follow this backend contract first:
  D:\AEU\Thesis\HR\aeu-hr-back-end\.claude\api\PAYROLL_API.md

Important backend access control:
This module uses backend permissions and policies.

Payroll permissions:

- payrolls.view_any
- payrolls.view_own
- payrolls.generate
- payrolls.update
- payrolls.submit
- payrolls.approve
- payrolls.reject

Payslip permissions:

- payslips.view_any
- payslips.view_own
- payslips.download_any
- payslips.download_own

Current role behavior from backend:

- admin: full access
- hr: payroll list/view/generate/edit/submit, can view/download payslips broadly
- ceo: payroll list/view/approve/reject, can view/download payslips broadly
- employee: can only view/download own approved payslips

Important:

- Frontend may use permission names if the existing app already exposes permissions in auth state.
- If the frontend currently uses roles instead of permission names, follow existing frontend convention.
- Backend remains the final authority. Always handle 403 gracefully.

Frontend goals:

1. HR Payroll Management

- Payroll batch list page
- Generate payroll modal/form
- Payroll batch detail page
- Edit payroll items before approval
- Submit payroll to CEO
- Show locked/read-only state for approved payroll

2. CEO Payroll Approval

- View submitted payroll batches
- Approve payroll
- Reject payroll with required rejection reason
- Show approval/rejection status clearly

3. Employee Payslips

- Payslip list page
- Payslip detail view
- Download approved payslip PDF
- Hide unapproved payslips from employees

4. Admin Access

- Admin can access payroll and payslip areas consistent with backend permissions

Required frontend behavior:

- Never calculate payroll totals on the frontend as the source of truth
- Frontend may display editable inputs, but backend response must always overwrite displayed totals
- Recalculate UI from backend response after generate, edit, submit, approve, reject
- Use backend validation and backend error messages
- Support loading, empty, error, forbidden, and success states
- Support paginated payroll and payslip lists
- Preserve current design system and existing frontend architecture
- Reuse existing API client, auth handling, table components, modal components, form components, and route guards
- Do not introduce a conflicting state management pattern if one already exists

Required pages/features:

1. Payroll list

- Show payroll batches with:
  - month
  - year
  - status
  - item_count
  - totals
  - generated_at
  - submitted_at
  - approved_at
  - rejected_at
- Support pagination
- Support filters if already natural in current app structure:
  - month
  - year
  - status
  - employee_id
- Show actions conditionally:
  - Generate payroll if user has payrolls.generate
  - View payroll if user has payrolls.view_any or payrolls.view_own
  - Submit if user has payrolls.submit and batch is draft
  - Approve if user has payrolls.approve and batch is pending_approval
  - Reject if user has payrolls.reject and batch is pending_approval

2. Payroll generation

- Build form/modal for POST /api/payrolls
- Inputs:
  - month
  - year
- On success:
  - refresh payroll list
  - open or link to payroll detail if appropriate
- Show duplicate payroll backend error cleanly

3. Payroll detail

- Fetch from GET /api/payrolls/{payroll}
- Display:
  - payroll batch summary
  - item_count
  - totals
  - rejection_reason if rejected
  - items table
- Each payroll item should show:
  - employee
  - base_salary
  - daily_rate
  - working_days
  - present_days
  - absent_days
  - unpaid_leave_days
  - gross_salary
  - unpaid_deduction
  - absence_deduction
  - taxable_salary
  - tax_rate
  - tax_amount
  - net_salary
  - status

4. Payroll edit

- Only allow edit if:
  - user has payrolls.update
  - payroll status is not approved
- Use PUT /api/payrolls/{payroll}
- Editable inputs only for fields allowed by backend contract
- After save:
  - replace displayed item totals with backend response
- Never trust local calculation over backend response
- If backend returns approved payroll locked error, switch UI to read-only state

5. Payroll submit

- Use POST /api/payrolls/{payroll}/submit
- Only available when:
  - user has payrolls.submit
  - payroll status is draft
- On success:
  - refresh payroll detail and list
  - show pending approval state

6. Payroll approve/reject

- Approve:
  - POST /api/payrolls/{payroll}/approve
  - only if user has payrolls.approve
  - only when batch is pending_approval
- Reject:
  - POST /api/payrolls/{payroll}/reject
  - only if user has payrolls.reject
  - require rejection_reason
- On success:
  - refresh payroll detail and list
  - if approved, show locked/read-only state
  - if rejected, show rejection reason and allow HR to revise if permitted

7. Payslip list

- Use GET /api/payslips
- Employee sees only own approved payslips
- HR/CEO/Admin can see broader results according to backend permission
- Show:
  - payroll batch month/year
  - payroll batch status
  - employee
  - net salary
  - tax amount
  - created_at / updated_at if useful
- Support pagination

8. Payslip detail

- Use GET /api/payslips/{payslip}
- Display stored snapshot values:
  - base_salary
  - daily_rate
  - working_days
  - present_days
  - absent_days
  - unpaid_leave_days
  - gross_salary
  - unpaid_deduction
  - absence_deduction
  - taxable_salary
  - tax_rate
  - tax_amount
  - net_salary
  - employee
  - payroll_batch info

9. Payslip PDF download

- Use GET /api/payslips/{payslip}/download
- Trigger browser file download from backend PDF endpoint
- Only show button when allowed by current auth state and hide/remove it after 403 if needed

Permission-aware UI requirements:

- If app already exposes permission names, use them directly for conditional rendering
- If app exposes only roles, map UI based on current app convention while still relying on backend 403 as final protection
- Do not expose actions the user clearly cannot perform
- Still handle direct URL access and button clicks safely when backend denies access

Forbidden/authorization handling:

- 403 on payroll pages:
  - show unauthorized state/page or redirect according to existing app pattern
- 403 on specific actions:
  - show toast/message
  - refresh data
  - disable or hide the denied action afterward if appropriate
- Prevent salary data leakage:
  - employees must never see other employees' payroll or payslip data
  - unapproved payslips must remain inaccessible to employees

Technical requirements:

- First inspect the frontend codebase and follow existing conventions
- Reuse existing routing, layout, auth, API service, table, modal, and form systems
- Add typed request/response models from backend contract
- Map backend validation errors to field-level UI
- Keep payroll status visually distinct:
  - draft
  - pending_approval
  - approved
  - rejected
- Keep approved payroll read-only in all edit views

Important API flows:

- POST /api/payrolls
- GET /api/payrolls
- GET /api/payrolls/{payroll}
- PUT /api/payrolls/{payroll}
- POST /api/payrolls/{payroll}/submit
- POST /api/payrolls/{payroll}/approve
- POST /api/payrolls/{payroll}/reject
- GET /api/payslips
- GET /api/payslips/{payslip}
- GET /api/payslips/{payslip}/download

Deliverables:

- Payroll list page
- Payroll generation modal/form
- Payroll detail page
- Payroll edit flow
- Payroll submit flow
- Payroll approve/reject flow
- Payslip list page
- Payslip detail page
- Payslip download action
- Frontend integration notes listing:
  - pages/components created
  - routes added
  - API methods added
  - permission or role checks used
  - any backend contract gaps found

Do not build mock APIs.
Do not invent fields not present in backend.
Do not implement frontend-side payroll calculations as source of truth.
Do not modify backend.
