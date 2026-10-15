import { buildUpgradeDiff } from './buildUpgradeDiff'
import type {
  EmployeeUpgradeRequest,
  UpgradeRequestStatus,
} from '../types/employee-upgrade-request'

export const UPGRADE_REQUEST_STATUS_LABELS: Record<UpgradeRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

export const CHANGE_CHIP_LABELS: Record<string, string> = {
  department_id: 'Transfer',
  position_id: 'Position',
  base_salary: 'Salary',
  employment_status: 'Status',
  manager_id: 'Manager',
}

const HEADLINE_ORDER = [
  'position_id',
  'department_id',
  'base_salary',
  'employment_status',
  'manager_id',
]

function parseDateOnly(value: string): Date {
  const datePart = value.includes('T') ? value.slice(0, 10) : value
  return new Date(`${datePart}T00:00:00`)
}

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function formatUpgradeDate(value: string | null): string {
  if (!value) return '—'
  return parseDateOnly(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  })
}

export function relativeEffectiveLabel(value: string | null): string {
  if (!value) return 'No date set'
  const days = Math.round((parseDateOnly(value).getTime() - startOfToday().getTime()) / 86_400_000)
  if (days < 0) return `${Math.abs(days)}d ago`
  if (days === 0) return 'Today'
  return `In ${days}d`
}

export function upgradeChangeChips(request: EmployeeUpgradeRequest): string[] {
  return buildUpgradeDiff(request.current_values, request.proposed_values).map(
    (row) => CHANGE_CHIP_LABELS[row.field] ?? row.label,
  )
}

export function upgradeChangeHeadline(request: EmployeeUpgradeRequest): string {
  const rows = buildUpgradeDiff(request.current_values, request.proposed_values)
  if (rows.length === 0) return '—'

  const ranked = [...rows].sort((a, b) => {
    const aIndex = HEADLINE_ORDER.indexOf(a.field)
    const bIndex = HEADLINE_ORDER.indexOf(b.field)
    return (
      (aIndex === -1 ? HEADLINE_ORDER.length : aIndex) -
      (bIndex === -1 ? HEADLINE_ORDER.length : bIndex)
    )
  })
  const primary = ranked[0]
  if (!primary) return '—'

  const after =
    primary.field === 'employment_status'
      ? primary.after.replace(/ \(Last Working Date:.*\)$/, '')
      : primary.after

  return `${primary.before} → ${after}`
}

export function nextEffectiveMonth(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date())
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  return `${year + (month === 12 ? 1 : 0)}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`
}

export function applicationLabel(request: EmployeeUpgradeRequest): string {
  if (request.status !== 'approved') return ''
  return request.application_state === 'applied'
    ? 'Applied'
    : request.application_state === 'failed'
      ? 'Failed'
      : 'Scheduled'
}
