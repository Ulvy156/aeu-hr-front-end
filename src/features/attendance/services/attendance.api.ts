import api from '@/lib/axios'
import type {
  Attendance,
  CorrectionPayload,
  MarkAbsentPayload,
  MarkAbsentResult,
  PaginationMeta,
} from '../types/attendance'

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

export async function clockIn(payload: {
  latitude: number
  longitude: number
}): Promise<ApiResponse<Attendance>> {
  const { data } = await api.post('/attendance/clock-in', payload)
  return data
}

export async function clockOut(payload: {
  latitude: number
  longitude: number
}): Promise<ApiResponse<Attendance>> {
  const { data } = await api.post('/attendance/clock-out', payload)
  return data
}

export async function fetchAttendance(
  params: Record<string, unknown> = {},
): Promise<PaginatedResponse<Attendance>> {
  const { data } = await api.get('/attendance', { params })
  return data
}

export async function correctAttendance(
  id: number,
  payload: CorrectionPayload,
): Promise<ApiResponse<Attendance>> {
  const { data } = await api.put(`/attendance/${id}/correction`, payload)
  return data
}

export async function markAbsent(
  payload: MarkAbsentPayload = {},
): Promise<ApiResponse<MarkAbsentResult>> {
  const { data } = await api.post('/attendance/mark-absent', payload)
  return data
}
