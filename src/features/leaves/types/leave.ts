export type LeaveType = 'annual' | 'sick' | 'special' | 'maternity' | 'unpaid'
export type DurationType = 'full_day' | 'half_day'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveEmployee {
  id: number
  employee_id: string
  full_name: string
}

export interface LeaveApprover {
  id: number
  name: string
}

export interface Leave {
  id: number
  leave_type: LeaveType
  start_date: string
  end_date: string
  duration_type: DurationType
  total_days: string
  reason: string
  status: LeaveStatus
  hr_approval_status: ApprovalStatus
  ceo_approval_status: ApprovalStatus
  rejection_reason: string | null
  cancelled_at: string | null
  employee: LeaveEmployee
  hr_approved_by_user: LeaveApprover | null
  ceo_approved_by_user: LeaveApprover | null
  created_at: string
  updated_at: string
}

export interface LeaveCreatePayload {
  leave_type: LeaveType | ''
  start_date: string
  end_date: string
  duration_type: DurationType | ''
  reason: string
}

export interface LeaveRejectPayload {
  rejection_reason: string
}

export interface LeaveBalance {
  leave_type: LeaveType
  entitlement: string | null
  used: string | null
  remaining: string | null
  is_unlimited: boolean
  rule: string
}

export interface LeaveBalanceData {
  employee: LeaveEmployee
  year: number
  balances: LeaveBalance[]
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface LeaveListFilters {
  status: string
  leave_type: string
  date_from: string
  date_to: string
  employee_id: string
  page: number
  per_page: number
}
