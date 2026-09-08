import type { LeaveBalance, SystemSettingsSummary } from '../types/dashboard'

export const DASHBOARD_MONTH_NAMES = [
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

export function formatDashboardMonth(month: number, year?: number): string {
  const label = DASHBOARD_MONTH_NAMES[month - 1] ?? String(month)
  return year != null ? `${label} ${year}` : label
}

export function formatDashboardMoney(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDashboardDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const raw = iso.includes('T') ? iso : `${iso}T00:00:00`
  return new Date(raw).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDashboardLongDate(iso: string | null | undefined): string {
  if (!iso) return '…'
  const raw = iso.includes('T') ? iso : `${iso}T00:00:00`
  return new Date(raw).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDashboardTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatWorkingTime(t: string | null | undefined): string {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = Number.parseInt(h ?? '0', 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${((hour % 12) || 12).toString().padStart(2, '0')}:${m} ${ampm}`
}

export function formatLeaveType(type: string): string {
  if (!type) return '—'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function formatLeaveTypeLabel(type: string): string {
  return `${formatLeaveType(type)} Leave`
}

export function formatRoleLabel(role: string): string {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function leaveBalanceTone(type: string): {
  wrap: string
  bar: string
} {
  const map: Record<string, { wrap: string; bar: string }> = {
    annual: { wrap: 'border-emerald-100 bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
    sick: { wrap: 'border-blue-100 bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
    special: { wrap: 'border-amber-100 bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
    maternity: { wrap: 'border-violet-100 bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
    unpaid: { wrap: 'border-slate-100 bg-slate-50 text-slate-600', bar: 'bg-slate-400' },
  }
  return map[type] ?? { wrap: 'border-slate-100 bg-slate-50 text-slate-600', bar: 'bg-slate-400' }
}

export function leaveUsedPercent(balance: LeaveBalance): number {
  if (balance.is_unlimited) return 0
  const entitlement = Number(balance.entitlement ?? 0)
  const used = Number(balance.used ?? 0)
  if (entitlement <= 0) return 0
  return Math.min(100, Math.round((used / entitlement) * 100))
}

export function attendanceStatusTone(
  status: string,
  isLate: boolean,
): { wrap: string; text: string; label: string } {
  if (isLate) {
    return {
      wrap: 'border-amber-100 bg-amber-50',
      text: 'text-amber-800',
      label: 'Late',
    }
  }
  if (status === 'present') {
    return {
      wrap: 'border-emerald-100 bg-emerald-50',
      text: 'text-emerald-800',
      label: 'Present',
    }
  }
  if (status === 'absent') {
    return {
      wrap: 'border-red-100 bg-red-50',
      text: 'text-red-800',
      label: 'Absent',
    }
  }
  return {
    wrap: 'border-slate-100 bg-slate-50',
    text: 'text-slate-700',
    label: formatLeaveType(status),
  }
}

export function attendanceMixPercents(summary: {
  total_records: number
  present_count: number
  late_count: number
  absent_count: number
  missing_clock_out_count: number
}): { present: number; late: number; absent: number; missing: number } {
  const total = summary.total_records || 1
  return {
    present: (summary.present_count / total) * 100,
    late: (summary.late_count / total) * 100,
    absent: (summary.absent_count / total) * 100,
    missing: (summary.missing_clock_out_count / total) * 100,
  }
}

export function roleMixEntries(usersByRole: Record<string, number>): { role: string; count: number }[] {
  return Object.entries(usersByRole)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
}

export function roleBarClass(role: string): string {
  const map: Record<string, string> = {
    employee: 'bg-emerald-500',
    hr: 'bg-blue-500',
    ceo: 'bg-amber-500',
    gm: 'bg-amber-400',
    admin: 'bg-violet-500',
  }
  return map[role] ?? 'bg-slate-400'
}

export function formatWorkingDaysSummary(settings: SystemSettingsSummary): string {
  const short = settings.working_days
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
    .join(', ')
  return `${short} · ${settings.working_days_count} days`
}

export const dashboardTableHeaderStyle = {
  background: '#f9fafb',
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
}
