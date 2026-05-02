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

export interface Employee {
  id: number
  employee_id: string
  full_name: string
  gender: 'male' | 'female' | 'other' | null
  date_of_birth: string | null
  phone_number: string | null
  email: string
  address: string | null
  join_date: string
  last_working_date: string | null
  base_salary: string
  employment_status: 'active' | 'resigned' | 'terminated'
  emergency_contact: string | null
  profile_photo: string | null
  profile_photo_url: string | null
  user: EmployeeUser | null
  department: EmployeeDepartment | null
  position: EmployeePosition | null
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

export interface EmployeeListParams {
  search?: string
  department_id?: number | null
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
