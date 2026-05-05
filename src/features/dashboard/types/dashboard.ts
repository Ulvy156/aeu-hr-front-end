export interface DashboardEmployee {
  id: number
  employee_id: string
  full_name: string
}

// ── Employee dashboard ─────────────────────────────────
export interface TodayAttendance {
  id: number
  attendance_date: string
  clock_in_time: string | null
  clock_out_time: string | null
  status: string
  is_late: boolean
  employee: DashboardEmployee
}

export interface LeaveBalance {
  leave_type: string
  entitlement: string | null
  used: string | null
  remaining: string | null
  is_unlimited: boolean
  rule: string
}

export interface LeaveBalanceData {
  employee: DashboardEmployee
  year: number
  balances: LeaveBalance[]
}

export interface LatestPayslip {
  id: number
  gross_salary: string
  tax_amount: string
  net_salary: string
  employee: DashboardEmployee
  payroll_batch: {
    id: number
    month: number
    year: number
    status: string
  }
}

export interface EmployeeDashboardData {
  today_attendance: TodayAttendance | null
  leave_balance: LeaveBalanceData | null
  latest_approved_payslip: LatestPayslip | null
}

// ── HR dashboard ───────────────────────────────────────
export interface AttendanceSummary {
  total_records: number
  present_count: number
  late_count: number
  absent_count: number
  missing_clock_out_count: number
}

export interface DashboardLeaveItem {
  id: number
  leave_type: string
  start_date: string
  end_date: string
  total_days: string
  status: string
  employee: DashboardEmployee
  created_at: string
}

export interface PendingLeaveSection {
  total: number
  items: DashboardLeaveItem[]
}

export interface DashboardPayrollBatch {
  id: number
  month: number
  year: number
  status: string
  item_count: number
  totals?: {
    gross_salary: string
    net_salary: string
  }
}

export interface PayrollStatusCounts {
  draft: number
  pending_approval: number
  approved: number
  rejected: number
}

export interface HrDashboardData {
  date: string
  today_attendance_summary: AttendanceSummary
  pending_leave_requests: PendingLeaveSection
  payroll_status: {
    counts: PayrollStatusCounts
    latest_batch: DashboardPayrollBatch | null
    latest_pending_approval_batch: DashboardPayrollBatch | null
  }
}

// ── CEO dashboard ──────────────────────────────────────
export interface CeoDashboardData {
  date: string
  pending_leave_approvals: PendingLeaveSection
  payroll_approval_summary: {
    pending_approval_count: number
    latest_pending_approval_batch: DashboardPayrollBatch | null
    recent_pending_batches: DashboardPayrollBatch[]
  }
}

// ── Admin dashboard ────────────────────────────────────
export interface UsersByRole {
  admin: number
  hr: number
  ceo: number
  employee: number
  [key: string]: number
}

export interface UserSummary {
  total_users: number
  active_users: number
  inactive_users: number
  users_by_role: UsersByRole
}

export interface SystemSettingsSummary {
  company_name: string
  salary_currency: string
  payroll_day_rate: number
  allowed_radius_meters: number
  working_start_time: string
  working_end_time: string
  working_days: string[]
  working_days_count: number
  office_location_configured: boolean
}

export interface AdminDashboardData {
  user_count: number
  user_summary: UserSummary
  system_settings_summary: SystemSettingsSummary
}
