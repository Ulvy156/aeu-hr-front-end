export interface AuditLogUser {
  id: number
  name: string
  email: string
}

export interface AuditLog {
  id: number
  user: AuditLogUser | null
  action: string
  module: string
  model_type: string | null
  model_id: number | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AuditUserOption {
  id: number
  name: string
}

export interface AuditLogFilterState {
  userId: number | null
  module: string
  action: string
  dateFrom: string
  dateTo: string
}

export interface AuditLogListParams {
  user_id?: number
  module?: string
  action?: string
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
