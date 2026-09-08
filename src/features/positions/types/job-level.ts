export const JOB_LEVEL = {
  JUNIOR: 'junior',
  SENIOR: 'senior',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  HEAD: 'head',
  GM: 'gm',
  CEO: 'ceo',
} as const

export type JobLevel = (typeof JOB_LEVEL)[keyof typeof JOB_LEVEL]

export const JOB_LEVEL_LABELS: Record<JobLevel, string> = {
  [JOB_LEVEL.JUNIOR]: 'Junior',
  [JOB_LEVEL.SENIOR]: 'Senior',
  [JOB_LEVEL.SUPERVISOR]: 'Supervisor',
  [JOB_LEVEL.MANAGER]: 'Manager',
  [JOB_LEVEL.HEAD]: 'Head',
  [JOB_LEVEL.GM]: 'GM',
  [JOB_LEVEL.CEO]: 'CEO',
}

export const JOB_LEVEL_OPTIONS: { label: string; value: JobLevel }[] = Object.entries(JOB_LEVEL_LABELS).map(
  ([value, label]) => ({ label, value: value as JobLevel }),
)

const DEFAULT_ROLE_BY_LEVEL: Record<JobLevel, string> = {
  [JOB_LEVEL.JUNIOR]: 'employee',
  [JOB_LEVEL.SENIOR]: 'employee',
  [JOB_LEVEL.SUPERVISOR]: 'employee',
  [JOB_LEVEL.MANAGER]: 'manager',
  [JOB_LEVEL.HEAD]: 'head',
  [JOB_LEVEL.GM]: 'gm',
  [JOB_LEVEL.CEO]: 'ceo',
}

export function defaultRoleForJobLevel(jobLevel: JobLevel): string {
  return DEFAULT_ROLE_BY_LEVEL[jobLevel]
}

export function formatJobLevel(jobLevel?: JobLevel | string | null): string {
  if (!jobLevel) return ''
  return JOB_LEVEL_LABELS[jobLevel as JobLevel] ?? jobLevel
}

export function formatPositionLabel(name: string, jobLevel?: JobLevel | string | null): string {
  const level = formatJobLevel(jobLevel)
  return level ? `${name} · ${level}` : name
}
