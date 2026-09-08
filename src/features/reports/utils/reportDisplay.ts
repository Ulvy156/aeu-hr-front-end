import type { ReportEmployee } from '../types/report'

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function formatReportMoney(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  const amount = Number(value)
  if (Number.isNaN(amount)) return String(value)
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatReportDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const value = iso.length === 10 ? `${iso}T00:00:00` : iso
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatReportTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function formatReportMonth(month: number | string | undefined): string {
  const index = Number(month) - 1
  return MONTH_SHORT[index] ?? String(month ?? '—')
}

export function formatLeaveType(value: string | undefined): string {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}

export function reportEmployeeName(row: {
  employee?: ReportEmployee | null
  full_name?: string
}): string {
  return row.employee?.full_name || row.full_name || '—'
}

export function reportEmployeeCode(row: {
  employee?: ReportEmployee | null
  employee_id?: string
}): string {
  return row.employee?.employee_id || row.employee_id || ''
}

export function formatBalancePair(
  bucket: { entitlement?: string | null; remaining?: string | null } | undefined,
): string {
  if (!bucket) return '—'
  if (bucket.entitlement == null && bucket.remaining == null) return '—'
  return `${bucket.entitlement ?? '—'} / ${bucket.remaining ?? '—'}`
}
