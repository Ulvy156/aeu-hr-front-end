import { EMPLOYMENT_STATUS_LABELS } from '@/features/employees/types/employee'
import type { UpgradeRequestValues } from '../types/employee-upgrade-request'

export interface UpgradeDiffRow {
  field: string
  label: string
  before: string
  after: string
}

interface NameLookup {
  id: number
  name: string
}

function fkName(id: number | undefined, options: NameLookup[]): string {
  if (id === undefined) return '—'
  return options.find((o) => o.id === id)?.name ?? `#${id}`
}

function fkNameOrNull(id: number | null | undefined, options: NameLookup[]): string {
  if (id === undefined) return '—'
  if (id === null) return 'No Manager'
  return options.find((o) => o.id === id)?.name ?? `#${id}`
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
  current: UpgradeRequestValues,
  proposed: UpgradeRequestValues,
  departments: NameLookup[],
  positions: NameLookup[],
  employees: NameLookup[] = [],
): UpgradeDiffRow[] {
  const rows: UpgradeDiffRow[] = []
  const fields = new Set([...Object.keys(current), ...Object.keys(proposed)])

  if (fields.has('department_id')) {
    rows.push({
      field: 'department_id',
      label: 'Department',
      before: fkName(current.department_id, departments),
      after: fkName(proposed.department_id, departments),
    })
  }

  if (fields.has('position_id')) {
    rows.push({
      field: 'position_id',
      label: 'Position',
      before: fkName(current.position_id, positions),
      after: fkName(proposed.position_id, positions),
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
      before: fkNameOrNull(current.manager_id, employees),
      after: fkNameOrNull(proposed.manager_id, employees),
    })
  }

  return rows
}
