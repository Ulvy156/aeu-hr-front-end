Implement Phase 7 Reports and Exports frontend integration using the existing frontend project structure and all rules in FRONTEND_RULES.md.

Backend contract:

- Read and follow:
  D:\AEU\Thesis\HR\aeu-hr-back-end\.claude\api\REPORTS_API.md
- Also align with existing related modules if needed:
  - D:\AEU\Thesis\HR\aeu-hr-back-end\.claude\api\ATTENDANCE_API.md
  - D:\AEU\Thesis\HR\aeu-hr-back-end\.claude\api\LEAVE_API.md
  - D:\AEU\Thesis\HR\aeu-hr-back-end\.claude\api\PAYROLL_API.md
- Use exact backend field names and exact backend status values.
- Do not invent fields that are not in the backend contract.

Permissions and access:
This feature uses backend permissions.
Relevant permissions:

- reports.payroll_view
- reports.payroll_export
- reports.attendance_view
- reports.attendance_export
- reports.leave_view
- reports.leave_export

Role behavior currently supported by backend:

- admin: full access
- hr: can view and export payroll, attendance, and leave reports
- ceo: can view payroll, attendance, and leave reports, but export may be restricted depending on permission assignment
- employee: no report access

Frontend auth rules:

- If the frontend already uses permission names, use them.
- If the frontend uses roles only, follow the existing project convention.
- Backend remains the final authority.
- Always handle 403 gracefully.

Goal:
Build frontend integration for Report and Export features for:

1. Payroll Reports
2. Attendance Reports
3. Leave Reports

Do not build mock APIs.
Do not change backend APIs.
Do not create a new frontend architecture.
Do not over-design this feature.

API endpoints to integrate:

- GET /api/reports/payroll
- GET /api/reports/payroll/export
- GET /api/reports/attendance
- GET /api/reports/attendance/export
- GET /api/reports/leave
- GET /api/reports/leave/export

Report types to support:

1. Payroll report_type

- employee_list
- monthly_summary
- status_summary

2. Attendance report_type

- daily_list
- monthly_summary
- late_employees
- absent_employees
- correction_list

3. Leave report_type

- request_list
- pending_approval
- approved
- rejected
- leave_balance

Required frontend structure:

- Follow the existing folder structure and naming conventions
- Reuse existing shared components like:
  - BaseCard
  - BaseTable
  - BaseModal if needed
  - SearchButton
  - ResetButton
- Reuse existing filter form patterns if they already exist in the project

Create service:

- src/services/reportService.ts

Service methods:

- getPayrollReport(params)
- exportPayrollReport(params)
- getAttendanceReport(params)
- exportAttendanceReport(params)
- getLeaveReport(params)
- exportLeaveReport(params)

Service requirements:

- Reuse the existing HTTP client/service layer
- Do not create another API wrapper
- Keep request params typed
- Keep response types typed
- Export methods should trigger file download using the existing app pattern

Create composable:

- src/composables/useReports.ts

Composable requirements:

- Handle:
  - loading
  - error
  - fetch
  - pagination state
  - filter state if that matches existing composable style
  - export action state
- Avoid duplicate API calls
- Do not add business rules into the composable

Pages or views:
Create or integrate report pages using the existing project route/module structure.
Use the existing frontend organization pattern.
If the project already groups reports under one section, keep that structure.

Expected report screens:

1. Payroll Reports page
   Support:

- report_type switcher:
  - employee_list
  - monthly_summary
  - status_summary
- filters:
  - month
  - year
  - status
  - employee_id
- show backend summary block
- show table content based on selected report_type
- export button for payroll export endpoint

Display guidance:

- employee_list:
  show employee, payroll batch, gross salary, tax amount, net salary, item status
- monthly_summary:
  show month, year, batch status, item count, gross salary, tax amount, net salary
- status_summary:
  show grouped status rows and totals from backend

Use exact backend statuses:

- draft
- pending_approval
- approved
- rejected

2. Attendance Reports page
   Support:

- report_type switcher:
  - daily_list
  - monthly_summary
  - late_employees
  - absent_employees
  - correction_list
- filters:
  - employee_id
  - attendance_date
  - date_from
  - date_to
  - month
  - year
  - status
- show backend summary block
- show table content based on selected report_type
- export button for attendance export endpoint

Display guidance:

- daily_list:
  show employee, attendance date, status, clock in, clock out, corrected_at
- monthly_summary:
  show employee-level aggregate rows
- late_employees:
  show only late rows from backend
- absent_employees:
  show only absent rows from backend
- correction_list:
  show corrected attendance rows

Use exact backend statuses:

- present
- late
- absent
- missing_clock_out

3. Leave Reports page
   Support:

- report_type switcher:
  - request_list
  - pending_approval
  - approved
  - rejected
  - leave_balance
- filters:
  - employee_id
  - status
  - leave_type
  - date_from
  - date_to
  - year
- show backend summary block
- show table content based on selected report_type
- export button for leave export endpoint

Display guidance:

- request_list / pending_approval / approved / rejected:
  show employee, leave_type, dates, total_days, status, hr_approval_status, ceo_approval_status
- leave_balance:
  show employee and balance fields returned by backend
  do not calculate balances on frontend

Use exact backend values:

- leave status:
  - pending
  - approved
  - rejected
  - cancelled
- leave type:
  - annual
  - sick
  - maternity
  - unpaid

UI requirements:

- Keep filters lightweight and useful
- Use cards for summary blocks
- Use tables for result rows
- Support loading state
- Support empty state
- Support error state
- Support paginated responses
- Support non-paginated responses like payroll status_summary cleanly
- Keep export buttons visible only when user is allowed
- Disable export button while exporting

Download/export behavior:

- Export endpoints return Excel files
- Trigger browser download using the project’s existing file-download pattern
- Preserve backend filename if possible
- Handle export failures gracefully

Authorization behavior:

- Hide report pages or actions if existing frontend auth state clearly says user lacks access
- Still handle direct navigation and 403 safely
- If backend returns 403:
  - show unauthorized state or redirect based on project pattern
  - do not keep retry-looping

Routing:

- Add report routes using existing router conventions
- Place them under the existing admin/hr/report area if such structure already exists
- Do not create random top-level routes if the project already has a reports section

Implementation notes:

- Prefer one shared reports page with tabs/segments if that matches the current project style
- Otherwise create separate PayrollReport, AttendanceReport, and LeaveReport views if that matches the current codebase better
- Follow existing state management patterns already used in the project
- Do not add charts unless the project already uses a chart solution and it clearly fits

Deliverables:

- src/services/reportService.ts
- src/composables/useReports.ts
- report pages/views integrated into existing module structure
- router updates
- permission/role-aware navigation updates if needed
- export button integration
- short implementation summary including:
  - files added/updated
  - routes added/updated
  - auth/permission approach used
  - any backend contract gaps found

Before coding:

- Inspect the current frontend project structure and follow it closely.
- Reuse existing patterns instead of introducing new ones.
