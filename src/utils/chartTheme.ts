/** Emerald-themed chart tokens aligned with UI_GUIDELINES. */

export const CHART_COLORS = {
  emerald: '#059669',
  emeraldSoft: '#34d399',
  amber: '#f59e0b',
  red: '#dc2626',
  blue: '#2563eb',
  violet: '#7c3aed',
  slate: '#94a3b8',
  slateSoft: '#cbd5e1',
  axis: '#e5e7eb',
  split: '#f1f5f9',
  label: '#64748b',
  mutedLabel: '#94a3b8',
} as const

export const CHART_STATUS_PALETTE = [
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.blue,
] as const

export const CHART_ROLE_COLORS: Record<string, string> = {
  employee: CHART_COLORS.emerald,
  hr: CHART_COLORS.blue,
  ceo: CHART_COLORS.amber,
  gm: '#fbbf24',
  admin: CHART_COLORS.violet,
}

export const CHART_LEAVE_COLORS: Record<string, string> = {
  annual: CHART_COLORS.emerald,
  sick: CHART_COLORS.blue,
  special: CHART_COLORS.amber,
  maternity: CHART_COLORS.violet,
  unpaid: CHART_COLORS.slate,
}

export const chartAxisLabel = {
  color: CHART_COLORS.label,
  fontSize: 11,
} as const

export const chartMutedAxisLabel = {
  color: CHART_COLORS.mutedLabel,
  fontSize: 11,
} as const

export function chartColorForRole(role: string): string {
  return CHART_ROLE_COLORS[role] ?? CHART_COLORS.slate
}

export function chartColorForLeave(type: string): string {
  return CHART_LEAVE_COLORS[type] ?? CHART_COLORS.slate
}
