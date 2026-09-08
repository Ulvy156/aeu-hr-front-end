import type { PayrollBatch, PayrollStatus, PayrollTotals } from '../types/payroll'

export const PAYROLL_MONTH_NAMES = [
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

export function formatPayrollPeriod(month: number, year: number): string {
  return `${PAYROLL_MONTH_NAMES[month - 1] ?? month} ${year}`
}

export function formatPayrollMoney(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPayrollDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function payrollStatusLabel(status: PayrollStatus): string {
  if (status === 'pending_approval') return 'Pending approval'
  if (status === 'draft') return 'Draft'
  if (status === 'approved') return 'Approved'
  return 'Rejected'
}

export function payrollTimeline(batch: PayrollBatch): string {
  if (batch.status === 'approved' && batch.approved_at) {
    return `Approved ${formatPayrollDate(batch.approved_at)}`
  }
  if (batch.status === 'rejected' && batch.rejected_at) {
    return `Rejected ${formatPayrollDate(batch.rejected_at)}`
  }
  if (batch.status === 'pending_approval' && batch.submitted_at) {
    return `Submitted ${formatPayrollDate(batch.submitted_at)}`
  }
  if (batch.generated_at) return `Generated ${formatPayrollDate(batch.generated_at)}`
  return ''
}

export function displayedDeductionTotal(totals?: PayrollTotals): string {
  if (!totals) return '—'
  const sum =
    Number(totals.unpaid_deduction ?? 0) +
    Number(totals.absence_deduction ?? 0) +
    Number(totals.special_sick_deduction ?? 0) +
    Number(totals.tax_amount ?? 0) +
    Number(totals.nssf_deduction ?? 0)
  return formatPayrollMoney(sum)
}

export function needsAttention(batch: PayrollBatch): boolean {
  return (
    batch.status === 'draft' || batch.status === 'pending_approval' || batch.status === 'rejected'
  )
}
