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
  status: 'active' | 'inactive'
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
  status: 'active' | 'inactive'
  roles: string[]
}

export interface UpdateUserPayload {
  name: string
  email: string
  status: 'active' | 'inactive'
  roles: string[]
}

export interface AssignRolesPayload {
  roles: string[]
}
