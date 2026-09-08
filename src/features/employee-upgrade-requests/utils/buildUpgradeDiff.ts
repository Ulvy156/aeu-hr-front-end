import { EMPLOYMENT_STATUS_LABELS } from '@/features/employees/types/employee'
import type {
  UpgradeRequestFkSnapshot,
  UpgradeRequestValueSnapshot,
} from '../types/employee-upgrade-request'

export interface UpgradeDiffRow {
  field: string
  label: string
  before: string
  after: string
}

function fkName(snapshot: UpgradeRequestFkSnapshot | undefined): string {
  if (snapshot === undefined) return '—'
  return snapshot.name ?? `#${snapshot.id}`
}

function fkNameOrNull(snapshot: UpgradeRequestFkSnapshot | null | undefined): string {
  if (snapshot === undefined) return '—'
  if (snapshot === null) return 'No Manager'
  return snapshot.name ?? `#${snapshot.id}`
}

function formatSalary(value: string | undefined): string {
  if (value === undefined) return '—'
  const num = Number(value)
  return Number.isFinite(num)
    ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value
}

function statusLabel(status: string | undefined): string {
  if (!status) return '—'
  return EMPLOYMENT_STATUS_LABELS[status as keyof typeof EMPLOYMENT_STATUS_LABELS] ?? status
}

export function buildUpgradeDiff(
  current: UpgradeRequestValueSnapshot,
  proposed: UpgradeRequestValueSnapshot,
): UpgradeDiffRow[] {
  const rows: UpgradeDiffRow[] = []
  const fields = new Set([...Object.keys(current), ...Object.keys(proposed)])

  if (fields.has('department_id')) {
    rows.push({
      field: 'department_id',
      label: 'Department',
      before: fkName(current.department_id),
      after: fkName(proposed.department_id),
    })
  }

  if (fields.has('position_id')) {
    rows.push({
      field: 'position_id',
      label: 'Position',
      before: fkName(current.position_id),
      after: fkName(proposed.position_id),
    })
  }

  if (fields.has('base_salary')) {
    rows.push({
      field: 'base_salary',
      label: 'Base Salary',
      before: formatSalary(current.base_salary),
      after: formatSalary(proposed.base_salary),
    })
  }

  if (fields.has('employment_status')) {
    let after = statusLabel(proposed.employment_status)
    if (proposed.employment_status) {
      after += ` (Last Working Date: ${proposed.last_working_date ?? '—'})`
    }
    rows.push({
      field: 'employment_status',
      label: 'Employment Status',
      before: statusLabel(current.employment_status),
      after,
    })
  }

  if (fields.has('manager_id')) {
    rows.push({
      field: 'manager_id',
      label: 'Manager',
      before: fkNameOrNull(current.manager_id),
      after: fkNameOrNull(proposed.manager_id),
    })
  }

  return rows
}
