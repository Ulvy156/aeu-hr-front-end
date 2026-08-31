export interface EmployeeDepartment {
  id: number
  name: string
  status: string
}

export interface EmployeePosition {
  id: number
  name: string
  status: string
}

export interface EmployeeUser {
  id: number
  name: string
  email: string
  status: string
  roles: string[]
}

export interface EmployeeManager {
  id: number
  employee_id: string
  full_name: string
}

export const EMPLOYMENT_STATUS = {
  FULL_TIME: 'full-time',
  PROBATION: 'probation',
  INTERN: 'intern',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
} as const

export type EmploymentStatus = (typeof EMPLOYMENT_STATUS)[keyof typeof EMPLOYMENT_STATUS]

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  [EMPLOYMENT_STATUS.FULL_TIME]: 'Full-time',
  [EMPLOYMENT_STATUS.PROBATION]: 'Probation',
  [EMPLOYMENT_STATUS.INTERN]: 'Intern',
  [EMPLOYMENT_STATUS.RESIGNED]: 'Resigned',
  [EMPLOYMENT_STATUS.TERMINATED]: 'Terminated',
}

export const EMPLOYMENT_STATUS_OPTIONS: { label: string; value: EmploymentStatus }[] = Object.entries(
  EMPLOYMENT_STATUS_LABELS,
).map(([value, label]) => ({ label, value: value as EmploymentStatus }))

// Statuses that keep the linked user account active and must not carry a last_working_date.
export const ACTIVE_EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  EMPLOYMENT_STATUS.FULL_TIME,
  EMPLOYMENT_STATUS.PROBATION,
  EMPLOYMENT_STATUS.INTERN,
]

// Statuses that deactivate the linked user account and require a last_working_date.
export const TERMINAL_EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  EMPLOYMENT_STATUS.RESIGNED,
  EMPLOYMENT_STATUS.TERMINATED,
]

export const ACTIVE_EMPLOYMENT_STATUS_OPTIONS = EMPLOYMENT_STATUS_OPTIONS.filter((o) =>
  ACTIVE_EMPLOYMENT_STATUSES.includes(o.value),
)

export interface EmployeeDocument {
  name: string
  size: number
  url: string
}

export interface Employee {
  id: number
  employee_id: string
  full_name: string
  gender: 'male' | 'female' | 'other' | null
  date_of_birth: string | null
  phone_number: string | null
  address: string | null
  join_date: string
  last_working_date: string | null
  base_salary: string
  employment_status: EmploymentStatus
  probation_end_date: string | null
  intern_end_date: string | null
  emergency_contact: string | null
  profile_photo: string | null
  profile_photo_url: string | null
  documents: EmployeeDocument[]
  user: EmployeeUser | null
  department: EmployeeDepartment | null
  position: EmployeePosition | null
  manager: EmployeeManager | null
  created_at: string
  updated_at: string
}

export interface DeptOption {
  id: number
  name: string
}

export interface PositionOption {
  id: number
  name: string
  department_id: number | null
}

export const DOCUMENT_ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx']
export const DOCUMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx'
export const DOCUMENT_MAX_COUNT = 5
export const DOCUMENT_MAX_TOTAL_SIZE = 20 * 1024 * 1024

export interface EmployeeListParams {
  search?: string
  department_id?: number | null
  include_ceo?: 1
  position_id?: number | null
  employment_status?: string
  per_page?: number
  page?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
