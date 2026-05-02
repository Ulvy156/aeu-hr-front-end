# HR Management System - Full Phase Breakdown

This document combines both:

```txt
1. Backend Phase Breakdown
2. Frontend Phase Breakdown
```

Use this file as the main development guide for the HR Management System MVP.

Recommended location:

```txt
D:\AEU\Thesis\HR\.claude\FULL_PHASE_BREAKDOWN.md
```

---

# Part 1: Backend Phase Breakdown

# HR Management System - Backend Phase Breakdown

## Purpose

This document defines the **backend-only development phases** for the HR Management System MVP.

Use this file inside the Laravel backend project:

```txt
backend/PHASE_BREAKDOWN.md
```

The backend is the **single source of truth** for all business logic.

The backend must handle:

- Authentication
- Authorization
- Database structure
- Business calculations
- GPS validation
- Attendance logic
- Leave logic
- Payroll logic
- Payslip PDF generation
- Reports and exports
- Audit logs
- API responses

The backend must **not** generate frontend code.

---

## Backend Development Flow

For every backend feature, follow this order:

```txt
1. Migration
2. Model + relationships
3. Enum if needed
4. Service class
5. Form Request
6. Controller
7. API Resource
8. Policy / Permission check
9. Route
10. Test
11. Frontend Integration Summary
```

After every backend module, update:

```txt
API_CONTRACT.md
```

The frontend should consume the API contract instead of guessing fields.

---

## AI Agent Setup Instruction

Use this instruction when working with an AI coding agent:

```txt
The Laravel backend project setup is mostly completed.

Some packages are already installed but not fully configured yet.

Do not reinstall existing packages unless required.

Before using any package, check whether it already exists in composer.json.

If the package exists but is not configured, configure it properly inside the correct phase.

Follow the backend phase breakdown strictly.

Do not generate frontend code.

Do not skip service classes, form requests, API resources, policies, permissions, tests, or API contract updates.
```

---

# Phase 0: Backend Setup

## Status

Mostly completed.

The Laravel backend project has already been created and the base environment setup is mostly ready.

Some required packages are already installed, but they are not fully configured yet. This is acceptable because package installation and package configuration are different steps.

Package configuration must be completed inside the related backend phase before the package is used.

### Current Setup Status

```txt
Project setup: Mostly completed
Package installation: Some packages already installed
Package configuration: Not fully completed yet
Backend development: Ready to continue phase by phase
```

### Package Configuration Rule

Do not configure every package randomly at the beginning.

Configure each package only when its related backend phase starts.

Examples:

```txt
Sanctum configuration       -> Phase 1.2 Authentication
Spatie Permission config    -> Phase 1.3 Roles and Permissions
PDF package configuration   -> Phase 5.5 Payslip API
Excel/export configuration  -> Phase 7 Reports and Exports API
```

Before installing any package, check `composer.json` first.

If the package is already installed, do not reinstall it. Configure it properly instead.

## Tasks

- Laravel backend project created
- `.env` configured or prepared
- MySQL database configured or prepared
- Sanctum installed or ready to configure
- Spatie Laravel Permission installed or ready to configure
- AI Agent files prepared
- Database diagram/schema prepared
- Backend folder structure reviewed
- Package configuration will be completed in the correct backend phase

## Recommended Backend Docs

```txt
D:\AEU\Thesis\HR\aeu-hr-back-end\.claude
├── AI_AGENT.md
├── DB_SCHEMA.md
├── API_CONTRACT.md
└── PHASE_BREAKDOWN.md
```

## Deliverables

- Laravel app runs successfully
- Database connection works
- Backend folder is clean
- AI Agent can read project requirements
- Backend docs are ready

---

# Phase 1: Backend Foundation

This is the most important backend phase.

Build this before all business modules.

---

## 1.1 Database Foundation

### Tasks

- Create base migrations from `DB_SCHEMA.md`
- Add foreign keys
- Add indexes
- Add soft deletes where needed
- Add seeders where needed

### Required MVP Tables

```txt
users
Spatie permission tables
departments
positions
employees
company_settings
public_holidays
attendances
leave_requests
payroll_batches
payroll_items
audit_logs
```

### Optional Later Tables

```txt
attendance_corrections
leave_balances
tax_brackets
backups
```

## Deliverables

- All MVP migrations exist
- Tables migrate successfully
- Foreign keys work
- Indexes are added
- Optional tables are not created unless needed

---

## 1.2 Authentication

### Tasks

- Install/configure Laravel Sanctum
- Create login API
- Create logout API
- Create `/api/me` API
- Hash passwords properly
- Revoke token on logout
- Add login rate limiting

### Endpoints

```txt
POST /api/login
POST /api/logout
GET  /api/me
```

## Deliverables

- User can login
- User receives token
- User can logout
- `/api/me` returns authenticated user
- Invalid login is rejected
- Login is rate limited

---

## 1.3 Roles and Permissions

### Tasks

- Install/configure Spatie Laravel Permission
- Create roles:
  - `admin`
  - `hr`
  - `ceo`
  - `employee`
- Create grouped permissions
- Create role/permission seeder
- Assign permissions to roles
- Add middleware checks
- Add policy checks where needed

### Important Rule

Do **not** add `role_id` to users table.

Spatie handles roles through:

```txt
roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
```

## Deliverables

- Roles are seeded
- Permissions are seeded
- Users can be assigned roles
- Protected routes reject unauthorized users
- `$user->can()` works
- `$user->hasRole()` works

---

## 1.4 Global API Response Format

### Tasks

Create consistent JSON responses.

### Success Response

```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": {}
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 0
  }
}
```

## Deliverables

- API responses are consistent
- Validation errors are clean
- Frontend can handle all response formats easily

---

## 1.5 Global Exception Handling

### Tasks

Handle:

- 400 bad request
- 401 unauthenticated
- 403 forbidden
- 404 not found
- 422 validation error
- 429 too many requests
- 500 server error

### Security Rule

Never expose stack traces or sensitive server errors in production.

## Deliverables

- Errors return JSON
- Sensitive errors are hidden
- Frontend receives readable messages

---

## 1.6 Audit Log System

### Tasks

- Create audit log migration
- Create AuditLog model
- Create AuditLogService
- Create reusable audit logging helper/trait if useful
- Log important actions

### Track Actions

- Login/logout if possible
- Attendance correction
- Payroll generation
- Payroll edit
- Payroll approval/rejection
- Leave approval/rejection
- Employee salary change
- Settings update
- User/role management
- Backup action if implemented

## Deliverables

- Audit logs are stored
- Audit logs include user, action, module, old/new values, IP, user agent
- Audit logs are protected
- Only Admin and CEO can view audit logs

---

## 1.7 Base Company Settings

### Tasks

- Create company setting model/service
- Seed default company settings
- Enforce single-row setting in service logic

### Default Settings

```txt
working_start_time = 08:00
working_end_time = 17:00
working_days = Monday to Saturday
salary_currency = USD
payroll_day_rate = 26
allowed_radius_meters = 100
```

## Deliverables

- Company settings exist
- Attendance can use GPS settings later
- Payroll can use payroll day rate later
- Service prevents multiple company setting rows

---

# Phase 2: Employee and Organization API

This phase builds the company structure.

---

## 2.1 Department API

### Tasks

- Department migration
- Department model
- Department enum/status
- Department service
- Store/update request validation
- Department controller
- Department resource
- Department policy/permissions
- Routes

### Endpoints

```txt
GET    /api/departments
POST   /api/departments
GET    /api/departments/{department}
PUT    /api/departments/{department}
DELETE /api/departments/{department}
```

## Deliverables

- HR/Admin can manage departments
- Department list supports pagination
- Department status works
- Department deletion is safe

---

## 2.2 Position API

### Tasks

- Position migration
- Position model
- Position service
- Store/update request validation
- Position controller
- Position resource
- Position policy/permissions
- Routes

### Endpoints

```txt
GET    /api/positions
POST   /api/positions
GET    /api/positions/{position}
PUT    /api/positions/{position}
DELETE /api/positions/{position}
```

## Deliverables

- HR/Admin can manage positions
- Position can optionally belong to department
- Position list supports filtering by department
- Position status works

---

## 2.3 Employee API

### Tasks

- Employee migration
- Employee model
- Employee service
- Employee form requests
- Employee controller
- Employee resource
- Employee policy/permissions
- Profile photo upload
- Link employee to user account

### Rules

- Employee ID must be unique
- User email must be unique
- Active employee should not have last working date
- Resigned/terminated employee must have last working date
- Base salary uses `decimal(15,2)`
- Profile photo uses Laravel Storage
- Validate image type and size

### Endpoints

```txt
GET    /api/employees
POST   /api/employees
GET    /api/employees/{employee}
PUT    /api/employees/{employee}
DELETE /api/employees/{employee}
```

## Deliverables

- HR/Admin can create employees
- HR/Admin can update employees
- HR/Admin can upload profile photo
- Employee status validation works
- Salary changes are audited
- Employee list supports pagination/filtering

---

# Phase 3: Attendance API

This phase handles GPS attendance, late detection, correction, and absent marking.

---

## 3.1 Clock In API

### Tasks

- Create Attendance model/service/controller/resource
- Create GPS validation logic using Haversine formula
- Validate latitude/longitude
- Read office GPS and radius from company settings
- Prevent duplicate clock-in
- Detect late status
- Store clock-in GPS

### Endpoint

```txt
POST /api/attendance/clock-in
```

### Request Example

```json
{
  "latitude": 11.5564,
  "longitude": 104.9282
}
```

### Error Example

```json
{
  "success": false,
  "message": "You are outside the allowed clock-in location.",
  "errors": {}
}
```

## Deliverables

- Employee can clock in
- GPS is validated on backend
- Missing GPS is rejected
- Outside radius is rejected
- Duplicate clock-in is prevented
- Late status works

---

## 3.2 Clock Out API

### Tasks

- Validate GPS
- Prevent clock-out without clock-in
- Prevent duplicate clock-out
- Store clock-out time and GPS
- Update status if needed

### Endpoint

```txt
POST /api/attendance/clock-out
```

## Deliverables

- Employee can clock out
- Invalid GPS is rejected
- Duplicate clock-out is prevented
- Missing clock-in is handled

---

## 3.3 Attendance List API

### Tasks

- Attendance listing
- Filter by employee
- Filter by date
- Filter by status
- Pagination
- Eager load employee data

### Endpoint

```txt
GET /api/attendance
```

## Deliverables

- HR/Admin can view attendance
- Employee can view own attendance
- Filters work
- Pagination works

---

## 3.4 Attendance Correction API

### Tasks

- HR/Admin correction
- Correction reason required
- Store correction fields:
  - `correction_reason`
  - `corrected_by`
  - `corrected_at`
- Audit old and new values
- Use database transaction

### Endpoint

```txt
PUT /api/attendance/{attendance}/correction
```

## Deliverables

- HR/Admin can correct attendance
- Employee cannot correct attendance
- Reason is required
- Audit log is created

---

## 3.5 Auto Absent Marking

### Tasks

Create service/command/manual endpoint to mark absent when:

- It is a working day
- It is not a public holiday
- Employee has no approved leave
- Employee has no attendance record

### Endpoint

```txt
POST /api/attendance/mark-absent
```

## Deliverables

- Absent records are created safely
- No duplicate absent records
- Join date is respected
- Last working date is respected
- Public holidays are excluded
- Approved leave is excluded

---

# Phase 4: Leave API

This phase handles leave requests, dynamic leave balances, cancellation, and dual approval.

---

## 4.1 Leave Request API

### Tasks

- LeaveRequest model/service/controller/resource
- Leave request validation
- Calculate total days on backend
- Support full day and half day
- Exclude public holidays
- Exclude non-working days
- Validate leave balance for paid leave

### Endpoint

```txt
POST /api/leaves
```

## Deliverables

- Employee can request leave
- Reason is required
- Total days calculated on backend
- Public holidays are excluded
- Non-working days are excluded
- Paid leave cannot exceed balance

---

## 4.2 Leave List and Detail API

### Tasks

- Leave list
- Leave detail
- Filter by status
- Filter by employee
- Filter by date range
- Role-based data access

### Endpoints

```txt
GET /api/leaves
GET /api/leaves/{leave}
```

## Deliverables

- Employee can view own leave
- HR/CEO can view approval lists
- Filters work
- Pagination works

---

## 4.3 Leave Balance API

### Rule

Do not create `leave_balances` table for MVP.

Calculate dynamically from approved leave requests.

### Endpoint

```txt
GET /api/leave-balances
```

## Deliverables

- Annual balance works
- Sick balance works
- Maternity rule works
- Unpaid leave has no balance limit

---

## 4.4 Leave Approval API

### Tasks

- HR approval
- CEO approval
- Approval order does not matter
- Leave becomes approved only when both approve
- If either rejects, leave becomes rejected
- Rejection reason required
- Use transaction
- Audit action

### Endpoints

```txt
POST /api/leaves/{leave}/approve
POST /api/leaves/{leave}/reject
```

## Deliverables

- HR can approve/reject
- CEO can approve/reject
- Employees cannot approve/reject
- Final status updates correctly
- Rejection reason is required
- Audit logs are created

---

## 4.5 Leave Cancellation API

### Tasks

- Employee can cancel own pending leave
- Cannot cancel approved/rejected leave
- Audit cancellation if needed

### Endpoint

```txt
POST /api/leaves/{leave}/cancel
```

## Deliverables

- Pending leave can be cancelled
- Non-pending leave cannot be cancelled
- Employee can only cancel own leave

---

# Phase 5: Payroll and Payslip API

This is the most sensitive backend phase.

Build carefully.

---

## 5.1 Payroll Generation API

### Tasks

- PayrollBatch model/service/controller/resource
- PayrollItem model/resource
- Generate payroll for all eligible employees
- Prevent duplicate payroll for same month/year
- Use transaction
- Audit payroll generation

### Endpoint

```txt
POST /api/payrolls/generate
```

## Deliverables

- HR can generate payroll
- Duplicate payroll is rejected
- Payroll batch is created
- Payroll items are created
- Payroll generation is audited

---

## 5.2 Payroll Calculation Engine

### Must Calculate

- Base salary
- Daily rate
- Working days
- Present days
- Absent days
- Unpaid leave days
- Gross salary
- Unpaid leave deduction
- Absence deduction
- Taxable salary
- Tax amount
- Net salary

### Formula

```txt
Daily salary = base_salary / 26
Unpaid leave deduction = daily salary * unpaid leave days
Absence deduction = daily salary * absent days
Taxable salary = gross salary - unpaid leave deduction - absence deduction
Net salary = taxable salary - tax
```

### Proration

```txt
Mid-month join:
Salary = monthly salary / 26 * working days from join date

Mid-month resignation/termination:
Salary = monthly salary / 26 * working days until last working date
```

## Deliverables

- Payroll calculation is backend-only
- Proration works
- Public holidays are respected
- Absent deduction works
- Unpaid leave deduction works
- Tax calculation works

---

## 5.3 Payroll Review/Edit API

### Tasks

- HR can view payroll
- HR can edit payroll before CEO approval
- Approved payroll cannot be edited
- Audit edits

### Endpoints

```txt
GET /api/payrolls
GET /api/payrolls/{payroll}
PUT /api/payrolls/{payroll}
```

## Deliverables

- Payroll list works
- Payroll detail works
- HR can edit before approval
- Approved payroll is locked

---

## 5.4 Payroll Submit/Approval API

### Tasks

- HR submits payroll to CEO
- CEO approves payroll
- CEO rejects payroll with reason
- Approved payroll becomes locked
- Payslip becomes visible after approval
- Use transactions
- Audit actions

### Endpoints

```txt
POST /api/payrolls/{payroll}/submit
POST /api/payrolls/{payroll}/approve
POST /api/payrolls/{payroll}/reject
```

## Deliverables

- HR can submit payroll
- CEO can approve payroll
- CEO can reject payroll
- Rejection reason is required
- Approved payroll is locked
- Audit logs are created

---

## 5.5 Payslip API

### Tasks

- Employee can view own approved payslips
- Generate PDF on demand using DomPDF
- Do not permanently store PDF unless required
- Protect access by role/permission

### Endpoints

```txt
GET /api/payslips
GET /api/payslips/{payslip}
GET /api/payslips/{payslip}/download
```

## Deliverables

- Employee can view own payslip
- Employee can download own payslip PDF
- HR/Admin/CEO can access based on permission
- Unapproved payslips are hidden from employees

---

# Phase 6: Dashboard API

Build dashboard APIs after core modules exist.

---

## 6.1 Employee Dashboard API

### Data

- Today attendance
- Leave balance
- Latest approved payslip

### Endpoint

```txt
GET /api/dashboard/employee
```

---

## 6.2 HR Dashboard API

### Data

- Today attendance summary
- Pending leave requests
- Payroll status

### Endpoint

```txt
GET /api/dashboard/hr
```

---

## 6.3 CEO Dashboard API

### Data

- Pending leave approvals
- Payroll approval summary

### Endpoint

```txt
GET /api/dashboard/ceo
```

---

## 6.4 Admin Dashboard API

### Data

- User count
- System settings summary

### Endpoint

```txt
GET /api/dashboard/admin
```

## Deliverables

- Dashboard APIs are role-protected
- Dashboard data is backend-calculated
- No unauthorized data leaks

---

# Phase 7: Reports and Exports API

Reports should be built after attendance, leave, and payroll are ready.

---

## 7.1 Payroll Reports

### Reports

- Monthly payroll summary
- Employee payroll list
- Payroll status report
- Export payroll to Excel

### Endpoints

```txt
GET /api/reports/payroll
GET /api/reports/payroll/export
```

---

## 7.2 Attendance Reports

### Reports

- Daily attendance list
- Monthly attendance summary
- Late employee list
- Absent employee list
- Attendance correction list
- Export attendance to Excel

### Endpoints

```txt
GET /api/reports/attendance
GET /api/reports/attendance/export
```

---

## 7.3 Leave Reports

### Reports

- Leave request list
- Pending approval list
- Approved leave list
- Rejected leave list
- Leave balance report
- Export leave report to Excel

### Endpoints

```txt
GET /api/reports/leave
GET /api/reports/leave/export
```

## Deliverables

- Reports support filters
- Reports use pagination where needed
- Excel exports work
- Reports are permission-protected
- No frontend-generated Excel needed

---

# Phase 8: Admin and Settings API

---

## 8.1 Company Settings API

### Tasks

- View company settings
- Update company settings
- Upload company logo
- Update office GPS
- Update working hours
- Update working days
- Update payroll day rate
- Enforce single-row settings in service

### Endpoints

```txt
GET /api/settings/company
PUT /api/settings/company
```

## Deliverables

- Admin can update settings
- Company logo upload works
- GPS settings update works
- Settings changes are audited

---

## 8.2 Public Holiday API

### Tasks

- Add public holiday
- Edit public holiday
- Disable/delete public holiday
- List public holidays

### Endpoints

```txt
GET    /api/public-holidays
POST   /api/public-holidays
PUT    /api/public-holidays/{holiday}
DELETE /api/public-holidays/{holiday}
```

## Deliverables

- Admin/HR can manage holidays
- Holidays affect attendance/payroll logic
- Changes are audited where needed

---

## 8.3 User Management API

### Tasks

- Admin manages users
- Create user
- Update user
- Disable user
- Assign roles
- Manual password reset

### Endpoints

```txt
GET    /api/users
POST   /api/users
GET    /api/users/{user}
PUT    /api/users/{user}
DELETE /api/users/{user}

GET /api/roles
GET /api/permissions
PUT /api/users/{user}/roles
```

## Deliverables

- Admin can manage users
- Admin can assign roles
- Password reset works
- User management is audited

---

## 8.4 Audit Logs API

### Tasks

- Admin/CEO can view audit logs
- Filter by user
- Filter by module
- Filter by action
- Filter by date

### Endpoint

```txt
GET /api/audit-logs
```

## Deliverables

- Admin/CEO can view audit logs
- HR/Employee cannot view audit logs
- Filters work

---

## 8.5 Manual Backup API

### MVP Note

No backups table required for MVP.

Track backup actions in audit logs.

### Tasks

- Admin triggers backup if environment supports it
- Admin downloads backup if implemented
- Log backup action in audit logs

### Endpoints

```txt
POST /api/backups
GET  /api/backups/{backup}/download
```

## Deliverables

- Backup action is Admin-only
- Backup action is audited
- Backup file is not publicly exposed

---

# Phase 9: Backend Testing and Polish

Final backend phase before demo/release.

---

## 9.1 Feature Tests

Test:

- Login
- Logout
- `/api/me`
- Role authorization
- Permission authorization
- Department CRUD
- Position CRUD
- Employee CRUD
- GPS validation
- Clock in
- Clock out
- Late detection
- Missing clock-out
- Attendance correction
- Auto absent marking
- Leave request
- Leave cancellation
- HR approval
- CEO approval
- Leave rejection
- Leave balance calculation
- Payroll generation
- Duplicate payroll prevention
- Payroll calculation
- Payroll approval
- Payroll rejection
- Payslip access permission
- Report permission
- Audit log permission

---

## 9.2 Performance Review

Check:

- N+1 queries
- Pagination
- Index usage
- Report filter performance
- Payroll generation transaction safety
- Duplicate query issues

---

## 9.3 Security Review

Check:

- Sensitive endpoints are protected
- Payroll data is protected
- Audit logs are protected
- Backup is protected
- File uploads are validated
- Login is rate limited
- GPS validation is backend-only
- No sensitive data in logs

---

## 9.4 Documentation

Finalize:

- API contract
- Database schema
- Setup guide
- Seeder guide
- Role/permission guide
- Testing checklist

## Deliverables

- Backend core flows tested
- Permission leaks fixed
- Error handling completed
- API documented
- Ready for frontend integration/demo

---

# Final Backend Phase Order

```txt
Phase 0: Backend Setup
Phase 1: Backend Foundation
Phase 2: Employee and Organization API
Phase 3: Attendance API
Phase 4: Leave API
Phase 5: Payroll and Payslip API
Phase 6: Dashboard API
Phase 7: Reports and Exports API
Phase 8: Admin and Settings API
Phase 9: Backend Testing and Polish
```

---

# Backend Rules Reminder

## Backend Must Calculate

- GPS distance
- Attendance status
- Late status
- Absent days
- Leave balance
- Leave approval status
- Payroll
- Tax
- Deductions
- Net salary
- Salary proration

## Backend Must Protect

- Payroll data
- Employee salary
- Audit logs
- Backup actions
- Settings
- User management

## Backend Must Not Generate

- Vue pages
- Vue components
- Pinia stores
- Frontend route guards
- Frontend UI code

---

## Final Setup Statement

```txt
The backend project setup is mostly completed.

Some required packages are already installed, but not fully configured yet. This is acceptable because package configuration should be completed during the related backend phase.

The project is ready to continue with Phase 1: Backend Foundation.
```

---

# End of Document


---

# Part 2: Frontend Phase Breakdown

# HR Management System - Frontend Phase Breakdown

## Purpose

This document defines the **frontend-only development phases** for the HR Management System MVP.

Use this file inside the Vue frontend project:

```txt
frontend/PHASE_BREAKDOWN.md
```

The frontend is responsible for:

- User interface
- Page layout
- Form handling
- API integration
- Authentication token handling
- Role-based route protection
- Permission-based UI visibility
- Data tables
- Filters and pagination UI
- Upload UI
- Download actions
- Error and success message display
- Dashboard visualization
- Frontend validation before sending API requests

The frontend must **not** calculate sensitive business logic.

The frontend must **not** be the source of truth for:

- Payroll calculation
- Tax calculation
- Attendance status
- GPS validation result
- Leave balance calculation
- Leave approval status
- Salary proration
- Permission enforcement
- Audit log creation

All sensitive logic must come from the backend API.

---

## Frontend Development Flow

For every frontend feature, follow this order:

```txt
1. Review API_CONTRACT.md
2. Create TypeScript types/interfaces
3. Create API service file
4. Create store/composable if needed
5. Add route
6. Build page component
7. Build reusable components
8. Add form validation
9. Add permission-based UI visibility
10. Handle loading/error/empty states
11. Connect with backend API
12. Test role access and UI behavior
13. Polish UI
```

After every frontend module, update:

```txt
API_CONTRACT.md
```

If the backend API response changes, update the related frontend type, service, and page.

---

## AI Agent Setup Instruction

Use this instruction when working with an AI coding agent:

```txt
The Vue frontend project setup is mostly completed.

Some packages are already installed but not fully configured yet.

Do not reinstall existing packages unless required.

Before using any package, check whether it already exists in package.json.

If the package exists but is not configured, configure it properly inside the correct phase.

Follow the frontend phase breakdown strictly.

Do not generate backend code.

Do not calculate backend-only business logic on the frontend.

Use TypeScript properly.

Use API service files instead of calling axios directly inside Vue pages.

Use reusable components where helpful.

Use role-based routes and permission-based UI visibility.

Always handle loading, error, empty, success, and validation states.

The frontend must consume API_CONTRACT.md instead of guessing backend fields.
```

---

# Phase 0: Frontend Setup

## Status

Mostly completed.

The Vue frontend project has already been created and the base environment setup is mostly ready.

Some required packages may already be installed, but they are not fully configured yet. This is acceptable because package installation and package configuration are different steps.

Package configuration must be completed inside the related frontend phase before the package is used.

### Current Setup Status

```txt
Project setup: Mostly completed
Package installation: Some packages already installed
Package configuration: Not fully completed yet
Frontend development: Ready to continue phase by phase
```

### Package Configuration Rule

Do not configure every package randomly at the beginning.

Configure each package only when its related frontend phase starts.

Examples:

```txt
Axios configuration       -> Phase 1.2 API Client Setup
Pinia configuration       -> Phase 1.3 State Management
Vue Router guards         -> Phase 1.4 Route Protection
Element Plus setup        -> Phase 1.5 UI Foundation
Chart library setup       -> Phase 6 Dashboard
File download helpers     -> Phase 5 Payslip / Phase 7 Reports
```

Before installing any package, check `package.json` first.

If the package is already installed, do not reinstall it. Configure it properly instead.

## Tasks

- Vue project created
- TypeScript enabled
- Tailwind CSS configured
- Element Plus installed or ready to configure
- Axios installed or ready to configure
- Pinia installed or ready to configure
- Vue Router installed or ready to configure
- Environment variables prepared
- Frontend folder structure reviewed
- AI Agent files prepared
- API contract prepared
- UI guideline prepared

## Recommended Frontend Docs

```txt
D:\AEU\Thesis\HR\aeu-hr-front-end\.claude
├── AI_AGENT.md
├── UI_GUIDELINES.md
├── API_CONTRACT.md
└── PHASE_BREAKDOWN.md
```

## Recommended Frontend Structure

```txt
src/
├── assets/
├── components/
│   ├── common/
│   ├── form/
│   ├── layout/
│   └── table/
├── composables/
├── constants/
├── layouts/
├── router/
├── services/
│   ├── api.ts
│   ├── auth.api.ts
│   ├── department.api.ts
│   ├── position.api.ts
│   ├── employee.api.ts
│   ├── attendance.api.ts
│   ├── leave.api.ts
│   ├── payroll.api.ts
│   ├── payslip.api.ts
│   ├── dashboard.api.ts
│   ├── report.api.ts
│   ├── setting.api.ts
│   ├── holiday.api.ts
│   ├── user.api.ts
│   └── audit-log.api.ts
├── stores/
├── types/
├── utils/
├── views/
└── main.ts
```

## Deliverables

- Vue app runs successfully
- Environment variables work
- Base folder structure is clean
- AI Agent can read project requirements
- Frontend docs are ready

---

# Phase 1: Frontend Foundation

This is the most important frontend phase.

Build this before all business modules.

---

## 1.1 UI Foundation

### Tasks

- Configure Tailwind CSS
- Configure Element Plus
- Create base layout
- Create auth layout
- Create dashboard layout
- Create sidebar
- Create top navbar
- Create page header component
- Create reusable card component
- Create loading component
- Create empty state component
- Create error state component
- Create confirmation dialog pattern
- Create reusable status badge component
- Create reusable action button group

### UI Rules

- Use clean admin dashboard layout
- Use consistent spacing
- Use soft rounded cards
- Use simple color system
- Keep screens readable and not crowded
- Use tables for management pages
- Use cards for dashboard summaries
- Use badges for statuses
- Use confirmation modal before dangerous actions
- Use responsive layout for laptop and desktop first
- Mobile responsive is required but not the main priority for MVP

## Deliverables

- Base UI layout works
- Sidebar works
- Navbar works
- Page header works
- Reusable UI components exist
- UI style is consistent

---

## 1.2 API Client Setup

### Tasks

- Configure Axios instance
- Read API base URL from environment variable
- Add request interceptor for auth token
- Add response interceptor for 401 errors
- Create global API response type
- Create paginated response type
- Create API error handler
- Create file download helper

### Environment Example

```txt
VITE_API_BASE_URL=http://localhost:8000/api
```

### Required Files

```txt
src/services/api.ts
src/types/api.types.ts
src/utils/api-error.ts
src/utils/download-file.ts
```

## Deliverables

- Frontend can call backend API
- Token is attached automatically
- 401 redirects user to login
- API errors are handled consistently
- Download helper works

---

## 1.3 State Management

### Tasks

- Configure Pinia
- Create auth store
- Store token
- Store authenticated user
- Store roles
- Store permissions
- Create helper methods:
  - `hasRole()`
  - `hasPermission()`
  - `isAuthenticated`
- Persist auth state safely

### Required Store

```txt
src/stores/auth.store.ts
```

## Deliverables

- Auth state works
- User data is available globally
- Role and permission checks work
- Refresh page does not instantly lose auth state
- Logout clears auth state

---

## 1.4 Route Protection

### Tasks

- Configure Vue Router
- Create public routes
- Create protected routes
- Add route meta for roles/permissions
- Add navigation guard
- Redirect unauthenticated users to login
- Redirect unauthorized users to forbidden page
- Create 404 page
- Create 403 page

### Route Meta Example

```ts
meta: {
  requiresAuth: true,
  roles: ['admin', 'hr'],
  permissions: ['employee.view']
}
```

## Deliverables

- Public routes work
- Protected routes work
- Unauthorized users are blocked
- Users cannot access pages by URL if not allowed
- 403 and 404 pages exist

---

## 1.5 Global Feedback System

### Tasks

- Configure success message pattern
- Configure error message pattern
- Configure validation error display
- Configure loading states
- Configure empty states
- Configure confirm dialogs for delete/submit/approve/reject actions

## Deliverables

- Success message is consistent
- Error message is readable
- Backend validation errors display under fields
- Loading state appears during API calls
- Empty table state is clean
- Destructive actions require confirmation

---

## 1.6 Auth Pages

### Tasks

- Create login page
- Connect login API
- Store token after login
- Fetch `/api/me`
- Redirect based on role
- Create logout action
- Handle invalid login error
- Show loading while logging in

### Pages

```txt
/views/auth/LoginView.vue
```

### Endpoints Used

```txt
POST /api/login
POST /api/logout
GET  /api/me
```

## Deliverables

- User can login
- User can logout
- Invalid login shows clear message
- User is redirected to correct dashboard
- Token is stored and used correctly

---

# Phase 2: Employee and Organization Frontend

This phase builds the company structure UI.

---

## 2.1 Department UI

### Tasks

- Create department type
- Create department API service
- Create department list page
- Create department create/edit form
- Add pagination
- Add search/filter if supported by API
- Add status badge
- Add create/update/delete actions
- Add permission-based action buttons

### Pages

```txt
/views/departments/DepartmentListView.vue
/views/departments/DepartmentFormView.vue
```

### API Service

```txt
src/services/department.api.ts
```

### Endpoints Used

```txt
GET    /api/departments
POST   /api/departments
GET    /api/departments/{department}
PUT    /api/departments/{department}
DELETE /api/departments/{department}
```

## Deliverables

- HR/Admin can manage departments
- Department list supports pagination
- Department form works
- Delete requires confirmation
- Unauthorized users cannot see action buttons

---

## 2.2 Position UI

### Tasks

- Create position type
- Create position API service
- Create position list page
- Create position create/edit form
- Add department dropdown
- Add filtering by department if supported
- Add status badge
- Add create/update/delete actions
- Add permission-based action buttons

### Pages

```txt
/views/positions/PositionListView.vue
/views/positions/PositionFormView.vue
```

### API Service

```txt
src/services/position.api.ts
```

### Endpoints Used

```txt
GET    /api/positions
POST   /api/positions
GET    /api/positions/{position}
PUT    /api/positions/{position}
DELETE /api/positions/{position}
```

## Deliverables

- HR/Admin can manage positions
- Position form supports department selection
- Position list supports filtering
- Status display works
- Unauthorized users cannot manage positions

---

## 2.3 Employee UI

### Tasks

- Create employee type
- Create employee API service
- Create employee list page
- Create employee detail page
- Create employee create/edit form
- Add profile photo upload UI
- Add department dropdown
- Add position dropdown
- Add employee status dropdown
- Add salary field display only for authorized roles
- Add pagination/filtering
- Add permission-based action buttons

### Pages

```txt
/views/employees/EmployeeListView.vue
/views/employees/EmployeeFormView.vue
/views/employees/EmployeeDetailView.vue
```

### API Service

```txt
src/services/employee.api.ts
```

### Endpoints Used

```txt
GET    /api/employees
POST   /api/employees
GET    /api/employees/{employee}
PUT    /api/employees/{employee}
DELETE /api/employees/{employee}
```

## Deliverables

- HR/Admin can create employees
- HR/Admin can update employees
- Profile photo upload works
- Employee detail page works
- Employee list supports pagination/filtering
- Salary is hidden from unauthorized users
- Employee status is displayed clearly

---

# Phase 3: Attendance Frontend

This phase handles attendance UI, GPS permission request, clock-in/out actions, list, and correction UI.

---

## 3.1 Clock In UI

### Tasks

- Create attendance API service
- Create employee attendance page
- Request browser location permission
- Send latitude and longitude to backend
- Show GPS permission error if denied
- Show backend rejection message if outside allowed location
- Prevent repeated button click while loading
- Show today attendance status

### Page

```txt
/views/attendance/MyAttendanceView.vue
```

### API Service

```txt
src/services/attendance.api.ts
```

### Endpoint Used

```txt
POST /api/attendance/clock-in
```

### Request Example

```json
{
  "latitude": 11.5564,
  "longitude": 104.9282
}
```

## Deliverables

- Employee can click clock-in
- Browser asks for GPS permission
- Frontend sends GPS to backend
- Backend decides if location is valid
- Frontend shows success/error message
- Duplicate clock-in error is displayed clearly

---

## 3.2 Clock Out UI

### Tasks

- Reuse browser location helper
- Send latitude and longitude to backend
- Show backend error for missing clock-in
- Show backend error for duplicate clock-out
- Update today attendance card after success

### Endpoint Used

```txt
POST /api/attendance/clock-out
```

## Deliverables

- Employee can click clock-out
- GPS is sent to backend
- Backend decides if clock-out is valid
- Frontend shows success/error message
- Attendance status refreshes after success

---

## 3.3 Attendance List UI

### Tasks

- Create attendance list page
- Add filters:
  - employee
  - date
  - status
- Add pagination
- Add status badges
- Show clock-in and clock-out time
- Show employee info for HR/Admin
- Show only own records for employee based on backend response

### Page

```txt
/views/attendance/AttendanceListView.vue
```

### Endpoint Used

```txt
GET /api/attendance
```

## Deliverables

- HR/Admin can view attendance list
- Employee can view own attendance
- Filters work
- Pagination works
- Status badge is clear

---

## 3.4 Attendance Correction UI

### Tasks

- Create correction modal/form
- Allow HR/Admin to update attendance record
- Require correction reason
- Show old value and new value if helpful
- Confirm before submitting correction
- Refresh table after success
- Hide correction action from employees

### Endpoint Used

```txt
PUT /api/attendance/{attendance}/correction
```

## Deliverables

- HR/Admin can correct attendance
- Correction reason is required
- Employee cannot see correction action
- Success/error message works
- Attendance list updates after correction

---

## 3.5 Auto Absent Marking UI

### Tasks

- Create admin/HR action button for mark absent
- Add confirmation dialog
- Show warning before running action
- Show success/error result
- Hide action from unauthorized users

### Endpoint Used

```txt
POST /api/attendance/mark-absent
```

## Deliverables

- HR/Admin can trigger absent marking
- Confirmation appears before action
- Unauthorized users cannot see the button
- Result message is clear

---

# Phase 4: Leave Frontend

This phase handles leave request UI, leave balances, approval, rejection, and cancellation.

---

## 4.1 Leave Request UI

### Tasks

- Create leave type
- Create leave API service
- Create leave request form
- Add leave type dropdown
- Add start date and end date picker
- Add full day/half day option
- Add reason textarea
- Show backend-calculated total days after submit or in detail
- Display backend validation errors
- Do not calculate final leave balance on frontend

### Page

```txt
/views/leaves/LeaveRequestView.vue
```

### API Service

```txt
src/services/leave.api.ts
```

### Endpoint Used

```txt
POST /api/leaves
```

## Deliverables

- Employee can request leave
- Form validation works
- Backend validation errors show clearly
- Leave request result is displayed
- Frontend does not override backend leave calculation

---

## 4.2 Leave List and Detail UI

### Tasks

- Create leave list page
- Create leave detail page
- Add filters:
  - status
  - employee
  - date range
- Add pagination
- Add status badges
- Display HR approval status
- Display CEO approval status
- Show rejection reason when rejected

### Pages

```txt
/views/leaves/LeaveListView.vue
/views/leaves/LeaveDetailView.vue
```

### Endpoints Used

```txt
GET /api/leaves
GET /api/leaves/{leave}
```

## Deliverables

- Employee can view own leave requests
- HR/CEO can view approval lists
- Filters work
- Pagination works
- Detail page clearly shows approval progress

---

## 4.3 Leave Balance UI

### Tasks

- Create leave balance card/page
- Display annual leave balance
- Display sick leave balance
- Display maternity leave rule if returned by API
- Display unpaid leave as no fixed limit
- Show loading and empty states

### Page

```txt
/views/leaves/LeaveBalanceView.vue
```

### Endpoint Used

```txt
GET /api/leave-balances
```

## Deliverables

- Employee can view leave balances
- Balances come from backend
- UI is simple and readable
- No frontend-only balance calculation

---

## 4.4 Leave Approval UI

### Tasks

- Create approval action buttons
- HR can approve/reject if allowed
- CEO can approve/reject if allowed
- Add rejection reason modal
- Require reason before rejection
- Confirm approval action
- Refresh leave detail/list after action
- Hide approval buttons from employees

### Endpoints Used

```txt
POST /api/leaves/{leave}/approve
POST /api/leaves/{leave}/reject
```

## Deliverables

- HR can approve/reject
- CEO can approve/reject
- Employee cannot see approval buttons
- Rejection reason modal works
- Approval status refreshes after action

---

## 4.5 Leave Cancellation UI

### Tasks

- Show cancel button only for own pending leave
- Add confirmation dialog
- Submit cancellation request
- Refresh leave status after success
- Hide cancel button for approved/rejected leave

### Endpoint Used

```txt
POST /api/leaves/{leave}/cancel
```

## Deliverables

- Employee can cancel own pending leave
- Non-pending leave cannot be cancelled
- Confirmation dialog works
- Status refreshes after cancellation

---

# Phase 5: Payroll and Payslip Frontend

This is the most sensitive frontend phase.

Frontend must display backend-calculated data only.

Do not calculate payroll manually on the frontend.

---

## 5.1 Payroll Generation UI

### Tasks

- Create payroll API service
- Create payroll list page
- Create generate payroll button
- Add month/year picker
- Confirm before generating payroll
- Show duplicate payroll error from backend
- Refresh payroll list after generation
- Hide generate button from unauthorized users

### Page

```txt
/views/payrolls/PayrollListView.vue
```

### API Service

```txt
src/services/payroll.api.ts
```

### Endpoint Used

```txt
POST /api/payrolls/generate
```

## Deliverables

- HR can generate payroll
- Month/year picker works
- Duplicate payroll error displays clearly
- Unauthorized users cannot see generate button
- Payroll list refreshes after generation

---

## 5.2 Payroll Calculation Display UI

### Must Display Backend Data

- Base salary
- Daily rate
- Working days
- Present days
- Absent days
- Unpaid leave days
- Gross salary
- Unpaid leave deduction
- Absence deduction
- Taxable salary
- Tax amount
- Net salary

### Frontend Rule

```txt
Do not calculate payroll values on the frontend.
Only display values returned by the backend.
```

## Deliverables

- Payroll detail displays all calculation fields
- Values are formatted as currency
- Sensitive values are hidden from unauthorized users
- Frontend does not modify backend calculation result

---

## 5.3 Payroll Review/Edit UI

### Tasks

- Create payroll detail page
- Create payroll item table
- Allow HR to edit allowed fields before approval
- Disable edit after approval
- Show locked state when payroll is approved
- Show audit-friendly confirmation before saving edit
- Refresh data after update

### Pages

```txt
/views/payrolls/PayrollDetailView.vue
/views/payrolls/PayrollEditView.vue
```

### Endpoints Used

```txt
GET /api/payrolls
GET /api/payrolls/{payroll}
PUT /api/payrolls/{payroll}
```

## Deliverables

- Payroll list works
- Payroll detail works
- HR can edit before approval
- Approved payroll is locked in UI
- Backend still controls real edit permission

---

## 5.4 Payroll Submit/Approval UI

### Tasks

- HR submit button
- CEO approve button
- CEO reject button
- Rejection reason modal
- Confirmation dialog before approve/submit
- Refresh payroll status after action
- Hide action buttons based on role/permission
- Show payroll status badge

### Endpoints Used

```txt
POST /api/payrolls/{payroll}/submit
POST /api/payrolls/{payroll}/approve
POST /api/payrolls/{payroll}/reject
```

## Deliverables

- HR can submit payroll
- CEO can approve payroll
- CEO can reject payroll
- Rejection reason is required
- Status updates correctly
- Approved payroll appears locked

---

## 5.5 Payslip UI

### Tasks

- Create payslip API service
- Create payslip list page
- Create payslip detail page
- Add download button
- Use file download helper
- Hide unapproved payslips from employee based on backend response
- Show payslip PDF download loading state

### Pages

```txt
/views/payslips/PayslipListView.vue
/views/payslips/PayslipDetailView.vue
```

### API Service

```txt
src/services/payslip.api.ts
```

### Endpoints Used

```txt
GET /api/payslips
GET /api/payslips/{payslip}
GET /api/payslips/{payslip}/download
```

## Deliverables

- Employee can view own approved payslips
- Employee can download payslip PDF
- HR/Admin/CEO can access based on permission
- Download works correctly
- Unapproved payslips are not displayed to employees

---

# Phase 6: Dashboard Frontend

Build dashboard pages after core modules exist.

---

## 6.1 Employee Dashboard UI

### Data

- Today attendance
- Leave balance
- Latest approved payslip

### Page

```txt
/views/dashboard/EmployeeDashboardView.vue
```

### Endpoint Used

```txt
GET /api/dashboard/employee
```

## Deliverables

- Employee dashboard shows useful summary
- Clock-in/out shortcut is visible if allowed
- Latest payslip link works
- Leave balance summary works

---

## 6.2 HR Dashboard UI

### Data

- Today attendance summary
- Pending leave requests
- Payroll status

### Page

```txt
/views/dashboard/HrDashboardView.vue
```

### Endpoint Used

```txt
GET /api/dashboard/hr
```

## Deliverables

- HR dashboard shows attendance summary
- Pending leave count is clear
- Payroll status is clear
- Shortcut links work

---

## 6.3 CEO Dashboard UI

### Data

- Pending leave approvals
- Payroll approval summary

### Page

```txt
/views/dashboard/CeoDashboardView.vue
```

### Endpoint Used

```txt
GET /api/dashboard/ceo
```

## Deliverables

- CEO dashboard shows pending approvals
- Payroll approval summary is clear
- Approve/review shortcuts work

---

## 6.4 Admin Dashboard UI

### Data

- User count
- System settings summary

### Page

```txt
/views/dashboard/AdminDashboardView.vue
```

### Endpoint Used

```txt
GET /api/dashboard/admin
```

## Deliverables

- Admin dashboard shows system overview
- User count is visible
- Settings summary is visible
- Admin shortcuts work

---

# Phase 7: Reports and Exports Frontend

Reports should be built after attendance, leave, and payroll pages are ready.

---

## 7.1 Payroll Reports UI

### Tasks

- Create payroll report page
- Add filters:
  - month
  - year
  - employee
  - status
- Display report table
- Add export button
- Use file download helper

### Page

```txt
/views/reports/PayrollReportView.vue
```

### Endpoints Used

```txt
GET /api/reports/payroll
GET /api/reports/payroll/export
```

## Deliverables

- Payroll report displays correctly
- Filters work
- Export button downloads Excel
- Unauthorized users cannot access payroll reports

---

## 7.2 Attendance Reports UI

### Tasks

- Create attendance report page
- Add filters:
  - date
  - employee
  - status
  - department
- Display report table
- Add export button
- Use file download helper

### Page

```txt
/views/reports/AttendanceReportView.vue
```

### Endpoints Used

```txt
GET /api/reports/attendance
GET /api/reports/attendance/export
```

## Deliverables

- Attendance report displays correctly
- Filters work
- Export button downloads Excel
- Late/absent status is easy to read
- Unauthorized users cannot access attendance reports

---

## 7.3 Leave Reports UI

### Tasks

- Create leave report page
- Add filters:
  - date range
  - employee
  - leave type
  - status
- Display report table
- Add export button
- Use file download helper

### Page

```txt
/views/reports/LeaveReportView.vue
```

### Endpoints Used

```txt
GET /api/reports/leave
GET /api/reports/leave/export
```

## Deliverables

- Leave report displays correctly
- Filters work
- Export button downloads Excel
- Unauthorized users cannot access leave reports

---

# Phase 8: Admin and Settings Frontend

---

## 8.1 Company Settings UI

### Tasks

- Create company settings page
- Display current settings
- Create update form
- Add company logo upload UI
- Add office GPS fields
- Add working hours fields
- Add working days selector
- Add payroll day rate field
- Add confirmation before saving

### Page

```txt
/views/settings/CompanySettingsView.vue
```

### API Service

```txt
src/services/setting.api.ts
```

### Endpoints Used

```txt
GET /api/settings/company
PUT /api/settings/company
```

## Deliverables

- Admin can view company settings
- Admin can update settings
- Company logo upload works
- GPS settings form works
- Settings update success/error message works

---

## 8.2 Public Holiday UI

### Tasks

- Create public holiday list page
- Create public holiday create/edit form
- Add date picker
- Add active/disabled status
- Add delete/disable confirmation
- Add permission-based buttons

### Pages

```txt
/views/holidays/PublicHolidayListView.vue
/views/holidays/PublicHolidayFormView.vue
```

### API Service

```txt
src/services/holiday.api.ts
```

### Endpoints Used

```txt
GET    /api/public-holidays
POST   /api/public-holidays
PUT    /api/public-holidays/{holiday}
DELETE /api/public-holidays/{holiday}
```

## Deliverables

- Admin/HR can manage holidays
- Holiday list works
- Holiday form works
- Delete/disable confirmation works
- Unauthorized users cannot manage holidays

---

## 8.3 User Management UI

### Tasks

- Create user list page
- Create user create/edit form
- Create role assignment UI
- Create manual password reset UI
- Add user status badge
- Add permissions display if needed
- Add delete/disable confirmation

### Pages

```txt
/views/users/UserListView.vue
/views/users/UserFormView.vue
/views/users/UserRoleView.vue
```

### API Service

```txt
src/services/user.api.ts
```

### Endpoints Used

```txt
GET    /api/users
POST   /api/users
GET    /api/users/{user}
PUT    /api/users/{user}
DELETE /api/users/{user}

GET /api/roles
GET /api/permissions
PUT /api/users/{user}/roles
```

## Deliverables

- Admin can manage users
- Admin can assign roles
- Manual password reset UI works
- User list supports pagination/filtering
- Unauthorized users cannot access user management

---

## 8.4 Audit Logs UI

### Tasks

- Create audit log page
- Add filters:
  - user
  - module
  - action
  - date
- Display audit log table
- Show old/new values in drawer/modal if needed
- Hide page from unauthorized users

### Page

```txt
/views/audit-logs/AuditLogListView.vue
```

### API Service

```txt
src/services/audit-log.api.ts
```

### Endpoint Used

```txt
GET /api/audit-logs
```

## Deliverables

- Admin/CEO can view audit logs
- Filters work
- Audit details are readable
- HR/Employee cannot access audit logs

---

## 8.5 Manual Backup UI

### Tasks

- Create backup action UI if backend supports it
- Add strong confirmation before backup
- Add download backup button if backend supports it
- Show backup action result
- Hide from non-admin users

### Endpoints Used

```txt
POST /api/backups
GET  /api/backups/{backup}/download
```

## Deliverables

- Admin can trigger backup if available
- Backup action has confirmation
- Backup download works if implemented
- Non-admin users cannot see backup actions

---

# Phase 9: Frontend Testing and Polish

Final frontend phase before demo/release.

---

## 9.1 Frontend Functional Testing

Test:

- Login
- Logout
- `/api/me` loading
- Token persistence
- Role-based route protection
- Permission-based button visibility
- Department CRUD UI
- Position CRUD UI
- Employee CRUD UI
- Profile photo upload UI
- GPS permission flow
- Clock in
- Clock out
- Attendance list filters
- Attendance correction form
- Leave request form
- Leave cancellation
- HR leave approval
- CEO leave approval
- Leave rejection reason modal
- Leave balance display
- Payroll generation UI
- Duplicate payroll error
- Payroll detail display
- Payroll approval/rejection UI
- Payslip list
- Payslip PDF download
- Report filters
- Report Excel download
- Company settings form
- Public holiday CRUD UI
- User management UI
- Audit log filters
- 403 page
- 404 page

---

## 9.2 UI/UX Review

Check:

- Consistent spacing
- Consistent colors
- Consistent buttons
- Consistent table actions
- Clear form labels
- Clear validation messages
- Loading states
- Empty states
- Error states
- Responsive behavior
- Sidebar active state
- Page titles
- Breadcrumbs if used
- Status badges

---

## 9.3 Security Review

Check:

- Token is not exposed unnecessarily
- Sensitive salary/payroll UI is hidden from unauthorized users
- Routes are protected
- Buttons are hidden based on permissions
- Frontend does not trust role only for backend security
- Frontend does not calculate payroll
- Frontend does not calculate tax
- Frontend does not decide GPS validity
- Frontend does not expose hidden API data in UI
- Logout clears token and user state

### Important Security Rule

Frontend security is only for user experience.

The backend must still enforce all real security rules.

---

## 9.4 Performance Review

Check:

- Avoid unnecessary API calls
- Use pagination for large tables
- Avoid loading all employees if not needed
- Use debounce for search filters
- Avoid duplicate requests
- Reuse components
- Avoid heavy dashboard rendering
- Lazy load routes if useful

---

## 9.5 Documentation

Finalize:

- Frontend setup guide
- Environment variable guide
- Folder structure guide
- API service guide
- Role/permission UI guide
- UI component guide
- Testing checklist

## Deliverables

- Frontend core flows tested
- UI is consistent
- Permission visibility works
- API integration completed
- Error handling completed
- Ready for demo/release

---

# Final Frontend Phase Order

```txt
Phase 0: Frontend Setup
Phase 1: Frontend Foundation
Phase 2: Employee and Organization Frontend
Phase 3: Attendance Frontend
Phase 4: Leave Frontend
Phase 5: Payroll and Payslip Frontend
Phase 6: Dashboard Frontend
Phase 7: Reports and Exports Frontend
Phase 8: Admin and Settings Frontend
Phase 9: Frontend Testing and Polish
```

---

# Frontend Rules Reminder

## Frontend Must Handle

- UI layout
- Form validation before request
- API service calls
- Token handling
- Route guards
- Role-based page access
- Permission-based button visibility
- Data tables
- Filters
- Pagination
- File upload UI
- File download UI
- Loading states
- Error states
- Empty states
- Success messages

## Frontend Must Not Calculate

- GPS distance validation result
- Attendance status
- Late status
- Absent days
- Leave balance
- Leave approval final status
- Payroll
- Tax
- Deductions
- Net salary
- Salary proration

## Frontend Must Protect UI For

- Payroll data
- Employee salary
- Audit logs
- Backup actions
- Settings
- User management
- Approval actions

## Frontend Must Not Generate

- Laravel migrations
- Laravel models
- Laravel controllers
- Laravel services
- Laravel policies
- Backend business logic
- Backend permission enforcement
- Backend payroll calculation

---

## Final Setup Statement

```txt
The frontend project setup is mostly completed.

Some required packages are already installed, but not fully configured yet. This is acceptable because package configuration should be completed during the related frontend phase.

The project is ready to continue with Phase 1: Frontend Foundation.
```

---

# End of Document


---

# Full Development Order Recommendation

## Recommended Build Flow

```txt
1. Backend Phase 0: Backend Setup
2. Frontend Phase 0: Frontend Setup

3. Backend Phase 1: Backend Foundation
4. Frontend Phase 1: Frontend Foundation

5. Backend Phase 2: Employee and Organization API
6. Frontend Phase 2: Employee and Organization Frontend

7. Backend Phase 3: Attendance API
8. Frontend Phase 3: Attendance Frontend

9. Backend Phase 4: Leave API
10. Frontend Phase 4: Leave Frontend

11. Backend Phase 5: Payroll and Payslip API
12. Frontend Phase 5: Payroll and Payslip Frontend

13. Backend Phase 6: Dashboard API
14. Frontend Phase 6: Dashboard Frontend

15. Backend Phase 7: Reports and Exports API
16. Frontend Phase 7: Reports and Exports Frontend

17. Backend Phase 8: Admin and Settings API
18. Frontend Phase 8: Admin and Settings Frontend

19. Backend Phase 9: Backend Testing and Polish
20. Frontend Phase 9: Frontend Testing and Polish
```

---

# Important Rule

Backend should be completed first for each feature module.

Frontend should only start a module after the related backend API contract is clear.

Example:

```txt
Backend Employee API ready
↓
API_CONTRACT.md updated
↓
Frontend Employee UI starts
```

This avoids guessing API fields and prevents frontend/backend mismatch.

---

# End of Full Phase Breakdown
