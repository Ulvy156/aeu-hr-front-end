import { ACTIVE_EMPLOYMENT_STATUSES, EMPLOYMENT_STATUS, type Employee } from '../types/employee'

function dateOnly(value: string): string {
  return value.slice(0, 10)
}

function parseDateOnly(value: string): Date {
  return new Date(`${dateOnly(value)}T00:00:00`)
}

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function formatEmployeeDate(value: string | null | undefined): string {
  if (!value) return '—'
  return parseDateOnly(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysFromToday(value: string): number {
  const target = parseDateOnly(value).getTime()
  return Math.round((target - startOfToday().getTime()) / 86_400_000)
}

export function employeeTenureLabel(joinDate: string): string {
  const start = parseDateOnly(joinDate)
  const today = startOfToday()
  let months =
    (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth())
  if (today.getDate() < start.getDate()) months -= 1
  if (months < 0) months = 0
  if (months < 1) {
    const days = Math.max(0, daysFromToday(joinDate) * -1)
    return days <= 1 ? 'Joined today' : `${days}d`
  }
  if (months < 12) return `${months} mo`
  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest === 0 ? `${years}y` : `${years}y ${rest}mo`
}

export function employmentStatusHint(employee: Employee): string {
  if (employee.employment_status === EMPLOYMENT_STATUS.PROBATION && employee.probation_end_date) {
    return `Until ${formatEmployeeDate(employee.probation_end_date)}`
  }
  if (employee.employment_status === EMPLOYMENT_STATUS.INTERN && employee.intern_end_date) {
    return `Until ${formatEmployeeDate(employee.intern_end_date)}`
  }
  if (
    !ACTIVE_EMPLOYMENT_STATUSES.includes(employee.employment_status) &&
    employee.last_working_date
  ) {
    return `Last day ${formatEmployeeDate(employee.last_working_date)}`
  }
  return ''
}
