export interface PositionDepartment {
  id: number
  name: string
  status: string
}

export interface Position {
  id: number
  name: string
  status: 'active' | 'inactive'
  department: PositionDepartment | null
  employees_count: number
  created_at: string
  updated_at: string
}

export interface DepartmentOption {
  id: number
  name: string
}

export interface PositionListParams {
  search?: string
  department_id?: number | null
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

export interface PositionPayload {
  name: string
  department_id: number | null
  status: 'active' | 'inactive'
}
