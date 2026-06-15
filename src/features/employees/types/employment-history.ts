export type EmploymentHistoryField =
  | 'department_id'
  | 'position_id'
  | 'base_salary'
  | 'employment_status'
  | 'probation_end_date'
  | 'manager_id'

export interface EmploymentHistoryFkValue {
  id: number
  name: string | null
}

export interface EmploymentHistoryScalarValue {
  value: string | number | null
}

export type EmploymentHistoryValue = EmploymentHistoryFkValue | EmploymentHistoryScalarValue | null

export interface EmploymentHistoryChangedBy {
  id: number
  name: string
}

export interface EmploymentHistoryEntry {
  id: number
  field: EmploymentHistoryField
  old_value: EmploymentHistoryValue
  new_value: EmploymentHistoryValue
  effective_date: string
  changed_by: EmploymentHistoryChangedBy
  created_at: string
}

export interface EmploymentHistoryListParams {
  field?: EmploymentHistoryField
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
