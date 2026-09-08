import { formatJobLevel } from '@/features/positions/types/job-level'
import type { ProfileUser } from '../types/profile'

export function formatProfileDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function profileValue(value: string | null | undefined): string {
  return value?.trim() || '—'
}

export function profileInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function profileDisplayName(profile: ProfileUser): string {
  return profile.employee?.full_name || profile.name
}

export function profileMetaLine(profile: ProfileUser): string {
  const emp = profile.employee
  if (!emp) return profile.email

  const parts = [
    emp.department?.name,
    emp.position?.name,
    formatJobLevel(profile.job_level) || null,
  ].filter(Boolean)

  return parts.length ? parts.join(' · ') : ''
}

export function profileTenureLabel(joinDate: string | null | undefined): string {
  if (!joinDate) return '—'
  const start = new Date(`${joinDate.slice(0, 10)}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let months =
    (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth())
  if (today.getDate() < start.getDate()) months -= 1
  if (months < 0) return '—'

  const years = Math.floor(months / 12)
  const rem = months % 12
  if (years === 0) return `${rem} mo`
  if (rem === 0) return `${years} yr`
  return `${years} yr ${rem} mo`
}

export function profilePermissionCountLabel(permissions: string[]): string {
  if (permissions[0] === '*') return 'All'
  return String(permissions.length)
}
