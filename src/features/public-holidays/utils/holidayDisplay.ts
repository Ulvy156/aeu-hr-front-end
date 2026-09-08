import type { PublicHoliday } from '../types/public-holiday'

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

export function formatHolidayDate(value: string | null | undefined): string {
  if (!value) return '—'
  return parseDateOnly(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function holidayWeekday(value: string): string {
  return parseDateOnly(value).toLocaleDateString('en-US', { weekday: 'short' })
}

export function daysFromToday(value: string): number {
  const target = parseDateOnly(value).getTime()
  return Math.round((target - startOfToday().getTime()) / 86_400_000)
}

export function holidayRelativeLabel(value: string): string {
  const days = daysFromToday(value)
  if (days < 0) return `${Math.abs(days)}d ago`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 30) return `In ${days}d`
  return formatHolidayDate(value).replace(/, \d{4}$/, '')
}

export function holidayCountdownLabel(value: string): string {
  const days = daysFromToday(value)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  if (days < 0) return `${Math.abs(days)}d ago`
  return `${days} days`
}

export function isUpcomingHoliday(holiday: PublicHoliday, withinDays = 90): boolean {
  if (holiday.status !== 'active') return false
  const days = daysFromToday(holiday.holiday_date)
  return days >= 0 && days <= withinDays
}

export function isSoonHoliday(holiday: PublicHoliday): boolean {
  return isUpcomingHoliday(holiday, 30)
}

export function sortHolidaysByDate(holidays: PublicHoliday[]): PublicHoliday[] {
  return [...holidays].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
}
