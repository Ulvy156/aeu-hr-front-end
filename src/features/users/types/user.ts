export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
}

export const USER_STATUS_OPTIONS: { label: string; value: UserStatus }[] = Object.entries(USER_STATUS_LABELS).map(
  ([value, label]) => ({ label, value: value as UserStatus }),
)

export interface UserDepartment {
  id: number
  name: string
}

export interface UserPosition {
  id: number
  name: string
}

export interface UserEmployee {
  id: number
  employee_id: string
  full_name: string
  employment_status: string
  department: UserDepartment | null
  position: UserPosition | null
}

export interface UserListItem {
  id: number
  name: string
  email: string
  status: UserStatus
  roles: string[]
  employee: UserEmployee | null
  created_at: string
  updated_at: string
}

export interface UserDetail extends UserListItem {
  permissions: string[]
}

export interface Role {
  id: number
  name: string
}

export interface Permission {
  id: number
  name: string
  module: string
}

export interface UserListParams {
  search?: string
  status?: string
  per_page?: number
  page?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  status: UserStatus
  roles: string[]
}

export interface UpdateUserPayload {
  name: string
  email: string
  status: UserStatus
  roles: string[]
}

export interface AssignRolesPayload {
  roles: string[]
}

export interface UserPermissionsResponse {
  user_id: number
  direct_permissions: string[]
  role_permissions: string[]
  all_permissions: string[]
}

export interface SyncUserPermissionsPayload {
  permissions: string[]
}

export interface AddUserPermissionPayload {
  permission: string
}

export interface RemoveUserPermissionPayload {
  permission: string
}

export interface ResetPasswordPayload {
  password: string
  password_confirmation: string
}

export interface UserSummary {
  total_users: number,
  active_users: number,
  inactive_users: number,
  users_by_role: {
    admin: number,
    hr: number,
    ceo: number,
    employee: number
  }
}