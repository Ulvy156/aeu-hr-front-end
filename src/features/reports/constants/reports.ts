export type ReportGroup = 'payroll' | 'attendance' | 'leave'

export type ReportFilterKey =
  | 'month'
  | 'year'
  | 'status'
  | 'employee_id'
  | 'attendance_date'
  | 'date_from'
  | 'date_to'
  | 'leave_type'

export interface ReportDefinition {
  id: string
  group: ReportGroup
  title: string
  description: string
  apiType: string
  filters: ReportFilterKey[]
  viewPermission: string
  exportPermission: string
}

export const REPORT_GROUPS: { id: ReportGroup; label: string; viewPermission: string }[] = [
  { id: 'payroll', label: 'Payroll', viewPermission: 'reports.payroll_view' },
  { id: 'attendance', label: 'Attendance', viewPermission: 'reports.attendance_view' },
  { id: 'leave', label: 'Leave', viewPermission: 'reports.leave_view' },
]

export const REPORTS: ReportDefinition[] = [
  {
    id: 'payroll_employee_list',
    group: 'payroll',
    title: 'Employee payroll list',
    description: 'Gross, tax, and net salary by employee and payroll batch.',
    apiType: 'employee_list',
    filters: ['month', 'year', 'status', 'employee_id'],
    viewPermission: 'reports.payroll_view',
    exportPermission: 'reports.payroll_export',
  },
  {
    id: 'payroll_monthly_summary',
    group: 'payroll',
    title: 'Monthly payroll summary',
    description: 'Batch totals and employee counts by month.',
    apiType: 'monthly_summary',
    filters: ['month', 'year', 'status'],
    viewPermission: 'reports.payroll_view',
    exportPermission: 'reports.payroll_export',
  },
  {
    id: 'payroll_status_summary',
    group: 'payroll',
    title: 'Payroll status summary',
    description: 'Batches and employees grouped by draft, pending, approved, or rejected.',
    apiType: 'status_summary',
    filters: ['year'],
    viewPermission: 'reports.payroll_view',
    exportPermission: 'reports.payroll_export',
  },
  {
    id: 'attendance_daily_list',
    group: 'attendance',
    title: 'Daily attendance',
    description: 'Clock-in and clock-out records for a selected date or range.',
    apiType: 'daily_list',
    filters: ['date_from', 'date_to', 'employee_id', 'status'],
    viewPermission: 'reports.attendance_view',
    exportPermission: 'reports.attendance_export',
  },
  {
    id: 'attendance_monthly_summary',
    group: 'attendance',
    title: 'Monthly attendance',
    description: 'Present, late, absent, and missing clock-out counts per employee.',
    apiType: 'monthly_summary',
    filters: ['month', 'year', 'employee_id'],
    viewPermission: 'reports.attendance_view',
    exportPermission: 'reports.attendance_export',
  },
  {
    id: 'attendance_late_employees',
    group: 'attendance',
    title: 'Late employees',
    description: 'Late clock-in records only.',
    apiType: 'late_employees',
    filters: ['month', 'year', 'date_from', 'date_to', 'employee_id'],
    viewPermission: 'reports.attendance_view',
    exportPermission: 'reports.attendance_export',
  },
  {
    id: 'attendance_absent_employees',
    group: 'attendance',
    title: 'Absent employees',
    description: 'Absence records for the selected period.',
    apiType: 'absent_employees',
    filters: ['month', 'year', 'date_from', 'date_to', 'employee_id'],
    viewPermission: 'reports.attendance_view',
    exportPermission: 'reports.attendance_export',
  },
  {
    id: 'attendance_correction_list',
    group: 'attendance',
    title: 'Attendance corrections',
    description: 'Corrected records with reason and who applied the change.',
    apiType: 'correction_list',
    filters: ['date_from', 'date_to', 'employee_id'],
    viewPermission: 'reports.attendance_view',
    exportPermission: 'reports.attendance_export',
  },
  {
    id: 'leave_request_list',
    group: 'leave',
    title: 'Leave requests',
    description: 'All leave requests with HR and CEO approval status.',
    apiType: 'request_list',
    filters: ['employee_id', 'status', 'leave_type', 'date_from', 'date_to'],
    viewPermission: 'reports.leave_view',
    exportPermission: 'reports.leave_export',
  },
  {
    id: 'leave_pending_approval',
    group: 'leave',
    title: 'Pending approval',
    description: 'Requests still waiting on HR or CEO.',
    apiType: 'pending_approval',
    filters: ['employee_id', 'leave_type', 'date_from', 'date_to'],
    viewPermission: 'reports.leave_view',
    exportPermission: 'reports.leave_export',
  },
  {
    id: 'leave_approved',
    group: 'leave',
    title: 'Approved leave',
    description: 'Approved requests in the selected period.',
    apiType: 'approved',
    filters: ['employee_id', 'leave_type', 'date_from', 'date_to'],
    viewPermission: 'reports.leave_view',
    exportPermission: 'reports.leave_export',
  },
  {
    id: 'leave_rejected',
    group: 'leave',
    title: 'Rejected leave',
    description: 'Rejected requests with the recorded reason.',
    apiType: 'rejected',
    filters: ['employee_id', 'leave_type', 'date_from', 'date_to'],
    viewPermission: 'reports.leave_view',
    exportPermission: 'reports.leave_export',
  },
  {
    id: 'leave_balance',
    group: 'leave',
    title: 'Leave balances',
    description: 'Entitlement versus remaining days by leave type for the year.',
    apiType: 'leave_balance',
    filters: ['year', 'employee_id'],
    viewPermission: 'reports.leave_view',
    exportPermission: 'reports.leave_export',
  },
]

export const PAYROLL_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending approval', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export const ATTENDANCE_STATUS_OPTIONS = [
  { label: 'Present', value: 'present' },
  { label: 'Late', value: 'late' },
  { label: 'Absent', value: 'absent' },
  { label: 'Missing clock-out', value: 'missing_clock_out' },
]

export const LEAVE_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const LEAVE_TYPE_OPTIONS = [
  { label: 'Annual', value: 'annual' },
  { label: 'Sick', value: 'sick' },
  { label: 'Special', value: 'special' },
  { label: 'Maternity', value: 'maternity' },
  { label: 'Unpaid', value: 'unpaid' },
]

export const REPORT_TABLE_HEADER_STYLE = {
  background: '#f9fafb',
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function reportMonthOptions(): { label: string; value: string }[] {
  return MONTH_NAMES.map((label, index) => ({ label, value: String(index + 1) }))
}

export function reportYearOptions(
  currentYear = new Date().getFullYear(),
): { label: string; value: string }[] {
  return Array.from({ length: 5 }, (_, i) => {
    const year = String(currentYear - 2 + i)
    return { label: year, value: year }
  })
}

export function isoDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function currentMonthValue(date = new Date()): string {
  return String(date.getMonth() + 1)
}

export function currentYearValue(date = new Date()): string {
  return String(date.getFullYear())
}

export function reportHasFilter(report: ReportDefinition, key: ReportFilterKey): boolean {
  return report.filters.includes(key)
}
