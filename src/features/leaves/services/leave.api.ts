import api from '@/lib/axios'
import type {
  Leave,
  LeaveCreatePayload,
  LeaveRejectPayload,
  LeaveBalanceData,
  PaginationMeta,
} from '../types/leave'

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

export async function fetchLeaves(
  params: Record<string, unknown> = {},
): Promise<PaginatedResponse<Leave>> {
  const { data } = await api.get('/leaves', { params })
  return data
}

export async function fetchLeave(id: number): Promise<ApiResponse<Leave>> {
  const { data } = await api.get(`/leaves/${id}`)
  return data
}

export async function createLeave(payload: LeaveCreatePayload): Promise<ApiResponse<Leave>> {
  const { data } = await api.post('/leaves', payload)
  return data
}

export async function approveLeave(id: number): Promise<ApiResponse<Leave>> {
  const { data } = await api.post(`/leaves/${id}/approve`)
  return data
}

export async function rejectLeave(
  id: number,
  payload: LeaveRejectPayload,
): Promise<ApiResponse<Leave>> {
  const { data } = await api.post(`/leaves/${id}/reject`, payload)
  return data
}

export async function cancelLeave(id: number): Promise<ApiResponse<Leave>> {
  const { data } = await api.post(`/leaves/${id}/cancel`)
  return data
}

export async function fetchLeaveBalances(
  params: Record<string, unknown> = {},
): Promise<ApiResponse<LeaveBalanceData>> {
  const { data } = await api.get('/leave-balances', { params })
  return data
}
