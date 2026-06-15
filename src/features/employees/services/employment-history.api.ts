import api from '@/lib/axios'
import type { EmploymentHistoryEntry, EmploymentHistoryListParams, PaginationMeta } from '../types/employment-history'

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

export async function fetchEmploymentHistory(
  employeeId: number,
  params: EmploymentHistoryListParams = {},
): Promise<PaginatedApiResponse<EmploymentHistoryEntry>> {
  const { data } = await api.get(`/employees/${employeeId}/employment-history`, { params })
  return data
}
