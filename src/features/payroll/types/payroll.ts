export type PayrollStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'
export type PayrollItemStatus = 'pending' | 'locked'

export interface PayrollEmployee {
  id: number
  employee_id: string
  full_name: string
}

export interface PayrollTotals {
  gross_salary: string
  unpaid_deduction: string
  absence_deduction: string
  tax_amount: string
  net_salary: string
}

export interface PayrollItem {
  id: number
  base_salary: string
  daily_rate: string
  working_days: string
  present_days: string
  absent_days: string
  unpaid_leave_days: string
  gross_salary: string
  unpaid_deduction: string
  absence_deduction: string
  taxable_salary: string
  tax_rate: string
  tax_amount: string
  net_salary: string
  status: PayrollItemStatus
  employee: PayrollEmployee
}

export interface PayrollBatch {
  id: number
  month: number
  year: number
  status: PayrollStatus
  rejection_reason: string | null
  item_count: number
  totals: PayrollTotals
  items?: PayrollItem[]
  generated_at?: string | null
  submitted_at?: string | null
  approved_at?: string | null
  rejected_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface GeneratePayrollPayload {
  month: number
  year: number
}

export interface UpdatePayrollItemPayload {
  id: number
  base_salary?: number
  working_days?: number
  present_days?: number
  absent_days?: number
  unpaid_leave_days?: number
  tax_amount?: number
}

export interface UpdatePayrollPayload {
  items: UpdatePayrollItemPayload[]
}

export interface RejectPayrollPayload {
  rejection_reason: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
