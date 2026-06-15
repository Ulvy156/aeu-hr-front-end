import type { EmploymentStatus } from '@/features/employees/types/employee'

export type UpgradeRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type { EmploymentStatus }

export interface UpgradeRequestValues {
  department_id?: number
  position_id?: number
  base_salary?: string
  employment_status?: EmploymentStatus
  last_working_date?: string | null
  manager_id?: number | null
}

export interface UpgradeRequestAttachment {
  name: string
  size: number
  url: string
}

export interface UpgradeRequestEmployeeRef {
  id: number
  employee_id: string
  full_name: string
}

export interface UpgradeRequestUserRef {
  id: number
  name: string
}

export interface EmployeeUpgradeRequest {
  id: number
  status: UpgradeRequestStatus
  current_values: UpgradeRequestValues
  proposed_values: UpgradeRequestValues
  effective_date: string | null
  rejection_reason: string | null
  attachments: UpgradeRequestAttachment[]
  employee: UpgradeRequestEmployeeRef
  requested_by: UpgradeRequestUserRef
  reviewed_by: UpgradeRequestUserRef | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeUpgradeRequestListParams {
  employee_id?: number
  status?: UpgradeRequestStatus
  per_page?: number
  page?: number
}

export interface EmployeeUpgradeRequestPayload {
  employee_id: number
  effective_date?: string | null
  proposed_values: UpgradeRequestValues
  attachments: File[]
}

export interface UpgradeRequestRejectPayload {
  rejection_reason: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
