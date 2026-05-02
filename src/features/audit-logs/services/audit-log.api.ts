import api from '@/lib/axios'
import type { AuditLog, AuditLogListParams, PaginationMeta } from '../types/audit-log'

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

export async function fetchAuditLogs(
  params: AuditLogListParams = {},
): Promise<PaginatedApiResponse<AuditLog>> {
  const { data } = await api.get('/audit-logs', { params })
  return data
}
