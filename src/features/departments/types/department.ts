export interface Department {
  id: number
  name: string
  status: 'active' | 'inactive'
  positions_count: number
  employees_count: number
  created_at: string
  updated_at: string
}

export interface DepartmentListParams {
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

export interface DepartmentPayload {
  name: string
  status: 'active' | 'inactive'
}
