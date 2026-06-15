import api from '@/lib/axios'
import type {
  EmployeeUpgradeRequest,
  EmployeeUpgradeRequestListParams,
  EmployeeUpgradeRequestPayload,
  PaginationMeta,
  UpgradeRequestRejectPayload,
} from '../types/employee-upgrade-request'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

export async function fetchUpgradeRequests(
  params: EmployeeUpgradeRequestListParams = {},
): Promise<PaginatedApiResponse<EmployeeUpgradeRequest>> {
  const { data } = await api.get('/employee-upgrade-requests', { params })
  return data
}

export async function fetchUpgradeRequest(id: number): Promise<ApiResponse<EmployeeUpgradeRequest>> {
  const { data } = await api.get(`/employee-upgrade-requests/${id}`)
  return data
}

export async function createUpgradeRequest(
  payload: EmployeeUpgradeRequestPayload,
): Promise<ApiResponse<EmployeeUpgradeRequest>> {
  if (payload.attachments.length > 0) {
    const fd = new FormData()
    fd.append('employee_id', String(payload.employee_id))
    if (payload.effective_date) fd.append('effective_date', payload.effective_date)
    Object.entries(payload.proposed_values).forEach(([key, value]) => {
      if (value === null || value === undefined) return
      fd.append(`proposed_values[${key}]`, String(value))
    })
    payload.attachments.forEach((file) => fd.append('attachments[]', file))
    const { data } = await api.post('/employee-upgrade-requests', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  const { data } = await api.post('/employee-upgrade-requests', {
    employee_id: payload.employee_id,
    ...(payload.effective_date ? { effective_date: payload.effective_date } : {}),
    proposed_values: payload.proposed_values,
  })
  return data
}

export async function approveUpgradeRequest(id: number): Promise<ApiResponse<EmployeeUpgradeRequest>> {
  const { data } = await api.post(`/employee-upgrade-requests/${id}/approve`)
  return data
}

export async function rejectUpgradeRequest(
  id: number,
  payload: UpgradeRequestRejectPayload,
): Promise<ApiResponse<EmployeeUpgradeRequest>> {
  const { data } = await api.post(`/employee-upgrade-requests/${id}/reject`, payload)
  return data
}

export async function cancelUpgradeRequest(id: number): Promise<ApiResponse<EmployeeUpgradeRequest>> {
  const { data } = await api.post(`/employee-upgrade-requests/${id}/cancel`)
  return data
}
