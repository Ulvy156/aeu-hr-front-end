export interface PayslipEmployee {
  id: number
  employee_id: string
  full_name: string
}

export interface PayslipBatch {
  id: number
  month: number
  year: number
  status: string
}

export interface Payslip {
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
  employee: PayslipEmployee
  payroll_batch: PayslipBatch
  created_at?: string
  updated_at?: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
