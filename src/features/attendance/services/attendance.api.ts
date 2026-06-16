import api from '@/lib/axios'
import type {
  Attendance,
  AttendanceSummary,
  CorrectionPayload,
  MarkAbsentPayload,
  MarkAbsentResult,
  PaginationMeta,
  ProxyClockPayload,
  QRToken,
  QRScanPayload,
  QRScanResult,
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

export async function fetchAttendanceSummary(
  params: { month?: number; year?: number } = {},
): Promise<ApiResponse<AttendanceSummary>> {
  const { data } = await api.get('/attendance/summary', { params })
  return data
}

export async function proxyClockIn(payload: ProxyClockPayload): Promise<ApiResponse<Attendance>> {
  const { data } = await api.post('/attendance/proxy-clock-in', payload)
  return data
}

export async function proxyClockOut(payload: ProxyClockPayload): Promise<ApiResponse<Attendance>> {
  const { data } = await api.post('/attendance/proxy-clock-out', payload)
  return data
}

export async function generateQRToken(): Promise<ApiResponse<QRToken>> {
  const { data } = await api.post('/attendance/qr/generate')
  return data
}

export async function fetchCurrentQRToken(): Promise<ApiResponse<QRToken | null>> {
  const { data } = await api.get('/attendance/qr/current')
  return data
}

export async function downloadQRCode(id: number): Promise<Blob> {
  const { data } = await api.get(`/attendance/qr/${id}/download`, { responseType: 'blob' })
  return data
}

export async function deleteQRToken(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/attendance/qr/${id}`)
  return data
}

export async function scanQRCode(payload: QRScanPayload): Promise<ApiResponse<QRScanResult>> {
  const { data } = await api.post('/attendance/qr/scan', payload)
  return data
}
