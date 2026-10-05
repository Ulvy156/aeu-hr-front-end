import api from '@/lib/axios'
import type {
  PayrollBatch,
  GeneratePayrollPayload,
  UpdatePayrollPayload,
  RejectPayrollPayload,
  PaginationMeta,
} from '../types/payroll'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

export async function fetchPayrolls(
  params: Record<string, unknown> = {},
): Promise<PaginatedResponse<PayrollBatch>> {
  const { data } = await api.get('/payrolls', { params })
  return data
}

export async function fetchMyPayrolls(
  params: Record<string, unknown> = {},
): Promise<PaginatedResponse<PayrollBatch>> {
  const { data } = await api.get('/payrolls/mine', { params })
  return data
}

export async function fetchPayroll(id: number): Promise<ApiResponse<PayrollBatch>> {
  const { data } = await api.get(`/payrolls/${id}`)
  return data
}

export async function downloadPayrollExcel(id: number): Promise<void> {
  const response = await api.get(`/payrolls/${id}/export`, { responseType: 'blob' })
  const disposition = response.headers['content-disposition'] ?? ''
  const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)["']?/i)
  const filename = match?.[1]?.trim() || `payroll-${id}.xlsx`
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function generatePayroll(
  payload: GeneratePayrollPayload,
): Promise<ApiResponse<PayrollBatch>> {
  const { data } = await api.post('/payrolls', payload)
  return data
}

export async function updatePayroll(
  id: number,
  payload: UpdatePayrollPayload,
): Promise<ApiResponse<PayrollBatch>> {
  const { data } = await api.put(`/payrolls/${id}`, payload)
  return data
}

export async function deletePayroll(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/payrolls/${id}`)
  return data
}

export async function submitPayroll(id: number): Promise<ApiResponse<PayrollBatch>> {
  const { data } = await api.post(`/payrolls/${id}/submit`)
  return data
}

export async function approvePayroll(id: number): Promise<ApiResponse<PayrollBatch>> {
  const { data } = await api.post(`/payrolls/${id}/approve`)
  return data
}

export async function rejectPayroll(
  id: number,
  payload: RejectPayrollPayload,
): Promise<ApiResponse<PayrollBatch>> {
  const { data } = await api.post(`/payrolls/${id}/reject`, payload)
  return data
}
