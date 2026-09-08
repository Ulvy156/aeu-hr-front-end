import type { Vacancy } from '../types/vacancy'

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function formatVacancyDate(value: string): string {
  return parseDateOnly(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function daysUntilTarget(value: string): number {
  const target = parseDateOnly(value).getTime()
  return Math.round((target - startOfToday().getTime()) / 86_400_000)
}

export function isVacancyOverdue(vacancy: Vacancy): boolean {
  return vacancy.status === 'open' && daysUntilTarget(vacancy.target_hiring_date) < 0
}

export function remainingHeadcount(vacancy: Vacancy): number {
  return Math.max(0, vacancy.required_headcount - vacancy.filled_headcount)
}

export function hiringFillPercent(filled: number, required: number): number {
  if (required <= 0) return 0
  return Math.min(100, Math.round((filled / required) * 100))
}

export function relativeTargetLabel(vacancy: Vacancy): string {
  if (vacancy.status === 'closed') return 'Closed'
  const days = daysUntilTarget(vacancy.target_hiring_date)
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days <= 14) return `Due in ${days}d`
  return `In ${days}d`
}
