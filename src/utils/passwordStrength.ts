import type { FormItemRule } from 'element-plus'

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel
  label: string
  percentage: number
  color: string
}

const STRENGTH_LEVELS: Record<Exclude<PasswordStrengthLevel, 'empty'>, { label: string; color: string }> = {
  weak: { label: 'Weak', color: '#dc2626' },
  fair: { label: 'Fair', color: '#f59e0b' },
  good: { label: 'Good', color: '#3b82f6' },
  strong: { label: 'Strong', color: '#059669' },
}

/**
 * Scores a password from 0-5 based on length and character variety.
 * Used for both the strength meter display and the "strong password" rule.
 */
function scorePassword(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { level: 'empty', label: '', percentage: 0, color: '#dcdfe6' }
  }

  const score = scorePassword(password)
  const percentage = (score / 5) * 100

  let level: Exclude<PasswordStrengthLevel, 'empty'>
  if (score <= 2) level = 'weak'
  else if (score === 3) level = 'fair'
  else if (score === 4) level = 'good'
  else level = 'strong'

  return { level, percentage, ...STRENGTH_LEVELS[level] }
}

/**
 * A password is considered strong when it has at least 8 characters and
 * mixes uppercase, lowercase, numbers, and special characters.
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}

export const STRONG_PASSWORD_MESSAGE =
  'Password must include uppercase, lowercase, a number, and a special character'

/** FormRules validator that flags weak passwords. Combine with a `required`/`min` rule. */
export const strongPasswordRule: FormItemRule = {
  validator: (_rule, value: string, callback: (error?: Error) => void) => {
    if (value && !isStrongPassword(value)) {
      callback(new Error(STRONG_PASSWORD_MESSAGE))
      return
    }
    callback()
  },
  trigger: 'blur',
}
