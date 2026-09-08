export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ReportData<T> {
  report_type: string
  summary: Record<string, unknown>
  items: T[]
}

export interface ReportResponse<T> {
  success: boolean
  message: string
  data: ReportData<T>
  meta?: PaginationMeta
}

// ── Payroll report item shapes ─────────────────────────
export interface ReportEmployee {
  id: number
  employee_id: string
  full_name: string
}

export interface ReportPayrollBatch {
  id: number
  month: number
  year: number
  status: string
}

export interface PayrollEmployeeListItem {
  id: number
  employee: ReportEmployee
  payroll_batch: ReportPayrollBatch
  base_salary: string
  gross_salary: string
  tax_amount: string
  net_salary: string
  status: string
}

export interface PayrollMonthlySummaryItem {
  id: number
  month: number
  year: number
  status: string
  item_count: number
  totals: {
    gross_salary: string
    tax_amount: string
    net_salary: string
  }
}

export interface PayrollStatusSummaryItem {
  status: string
  batch_count: number
  item_count: number
  gross_salary: string
  tax_amount: string
  nssf_deduction: string
  net_salary: string
}

// ── Attendance report item shapes ──────────────────────
export interface AttendanceReportItem {
  id: number
  attendance_date: string
  clock_in_time: string | null
  clock_out_time: string | null
  status: string
  is_late: boolean
  correction_reason: string | null
  corrected_at: string | null
  employee: ReportEmployee
  corrected_by_user: { id: number; name: string } | null
}

export interface AttendanceMonthlySummaryItem {
  id: number
  employee_id: string
  full_name: string
  present_count: number
  late_count: number
  absent_count: number
  missing_clock_out_count: number
  total_records: number
  employee?: ReportEmployee
}

// ── Leave report item shapes ───────────────────────────
export interface LeaveReportItem {
  id: number
  leave_type: string
  start_date: string
  end_date: string
  total_days: string
  status: string
  hr_approval_status: string
  ceo_approval_status: string
  rejection_reason: string | null
  employee: ReportEmployee
  created_at: string
}

export interface LeaveBalanceBucket {
  entitlement?: string | null
  used?: string | null
  remaining?: string | null
  rule?: string
}

export interface LeaveBalanceReportItem {
  employee: ReportEmployee
  year: number
  annual?: LeaveBalanceBucket
  sick?: LeaveBalanceBucket
  special?: LeaveBalanceBucket
  maternity?: LeaveBalanceBucket
  unpaid?: LeaveBalanceBucket
}

// ── Filter param shapes ────────────────────────────────
export interface PayrollReportParams {
  report_type: string
  month?: string
  year?: string
  status?: string
  employee_id?: string
  page?: number
  per_page?: number
}

export interface AttendanceReportParams {
  report_type: string
  employee_id?: string
  attendance_date?: string
  date_from?: string
  date_to?: string
  month?: string
  year?: string
  status?: string
  page?: number
  per_page?: number
}

export interface LeaveReportParams {
  report_type: string
  employee_id?: string
  status?: string
  leave_type?: string
  date_from?: string
  date_to?: string
  year?: string
  page?: number
  per_page?: number
}
