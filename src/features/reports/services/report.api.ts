import api from '@/lib/axios'
import type {
  ReportResponse,
  PayrollReportParams,
  AttendanceReportParams,
  LeaveReportParams,
} from '../types/report'

function buildParams(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
}

function triggerDownload(blob: Blob, fallbackName: string, headers: Record<string, string>) {
  const disposition = headers['content-disposition'] ?? ''
  const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)["']?/i)
  const filename = match?.[1]?.trim() || fallbackName
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Payroll ─────────────────────────────────────────────
export async function getPayrollReport(params: PayrollReportParams): Promise<ReportResponse<unknown>> {
  const { data } = await api.get('/reports/payroll', { params: buildParams(params) })
  return data
}

export async function exportPayrollReport(params: PayrollReportParams): Promise<void> {
  const response = await api.get('/reports/payroll/export', {
    params: buildParams(params),
    responseType: 'blob',
  })
  triggerDownload(response.data, `payroll-${params.report_type}-report.xlsx`, response.headers as Record<string, string>)
}

// ── Attendance ───────────────────────────────────────────
export async function getAttendanceReport(params: AttendanceReportParams): Promise<ReportResponse<unknown>> {
  const { data } = await api.get('/reports/attendance', { params: buildParams(params) })
  return data
}

export async function exportAttendanceReport(params: AttendanceReportParams): Promise<void> {
  const response = await api.get('/reports/attendance/export', {
    params: buildParams(params),
    responseType: 'blob',
  })
  triggerDownload(response.data, `attendance-${params.report_type}-report.xlsx`, response.headers as Record<string, string>)
}

// ── Leave ────────────────────────────────────────────────
export async function getLeaveReport(params: LeaveReportParams): Promise<ReportResponse<unknown>> {
  const { data } = await api.get('/reports/leave', { params: buildParams(params) })
  return data
}

export async function exportLeaveReport(params: LeaveReportParams): Promise<void> {
  const response = await api.get('/reports/leave/export', {
    params: buildParams(params),
    responseType: 'blob',
  })
  triggerDownload(response.data, `leave-${params.report_type}-report.xlsx`, response.headers as Record<string, string>)
}
