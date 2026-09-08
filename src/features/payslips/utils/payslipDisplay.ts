import type { Payslip } from '../types/payslip'

export const PAYSLIP_MONTH_NAMES = [
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

export function formatPayslipPeriod(month: number, year: number): string {
  return `${PAYSLIP_MONTH_NAMES[month - 1] ?? month} ${year}`
}

export function formatPayslipMoney(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPayslipDays(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(1)
}

export function formatPayslipTaxRate(value: string | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  return `${(Number(value) * 100).toFixed(2)}%`
}

export function hasPayslipAmount(value: string | undefined): boolean {
  return Number(value ?? 0) > 0
}

export function displayedPayslipDeductions(payslip: Payslip): string {
  const sum =
    Number(payslip.unpaid_deduction ?? 0) +
    Number(payslip.absence_deduction ?? 0) +
    Number(payslip.maternity_deduction ?? 0) +
    Number(payslip.tax_amount ?? 0) +
    Number(payslip.nssf_deduction ?? 0)
  return formatPayslipMoney(sum)
}

export function attendanceSummary(payslip: Payslip): string {
  const extras: string[] = []
  if (hasPayslipAmount(payslip.absent_days)) {
    extras.push(`${formatPayslipDays(payslip.absent_days)} absent`)
  }
  if (hasPayslipAmount(payslip.unpaid_leave_days)) {
    extras.push(`${formatPayslipDays(payslip.unpaid_leave_days)} unpaid`)
  }
  if (hasPayslipAmount(payslip.maternity_leave_days)) {
    extras.push(`${formatPayslipDays(payslip.maternity_leave_days)} maternity`)
  }
  return extras.length > 0 ? extras.join(' · ') : 'Full attendance'
}

export function attendanceBarPercents(payslip: Payslip): {
  present: number
  unpaid: number
  absent: number
} {
  const working = Number(payslip.working_days)
  if (working <= 0) return { present: 0, unpaid: 0, absent: 0 }
  const share = (value: string | undefined) => Math.max(0, (Number(value ?? 0) / working) * 100)
  return {
    present: share(payslip.present_days),
    unpaid: share(payslip.unpaid_leave_days),
    absent: share(payslip.absent_days),
  }
}
