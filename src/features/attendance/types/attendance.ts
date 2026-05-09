export type AttendanceStatus = 'present' | 'late' | 'absent' | 'missing_clock_out'

export interface AttendanceEmployee {
  id: number
  employee_id: string
  full_name: string
}

export interface ProxiedByUser {
  id: number
  name: string
  email: string
}

export interface ProxyClockPayload {
  employee_id: string
  attendance_date: string
}

export interface AttendanceCorrectedBy {
  id: number
  name: string
}

export interface Attendance {
  id: number
  attendance_date: string
  clock_in_time: string | null
  clock_out_time: string | null
  status: AttendanceStatus
  is_late: boolean
  correction_reason: string | null
  corrected_at: string | null
  employee: AttendanceEmployee
  corrected_by_user: AttendanceCorrectedBy | null
  proxied_clock_in_by_user: ProxiedByUser | null
  proxied_clock_out_by_user: ProxiedByUser | null
  created_at: string
  updated_at: string
}

export interface CorrectionPayload {
  clock_in_time?: string
  clock_out_time?: string
  status: AttendanceStatus
  correction_reason: string
}

export interface MarkAbsentPayload {
  attendance_date?: string
}

export interface MarkAbsentResult {
  attendance_date: string
  created_count: number
}

export interface AttendanceListFilters {
  date_from: string
  date_to: string
  status: string
  page: number
  per_page: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AttendanceSummaryData {
  present: number
  late: number
  absent: number
  missing_clock_out: number
  attended_days: number
  working_days_in_period: number
  attendance_rate: string
}

export interface AttendanceTodayData {
  status: AttendanceStatus
  clock_in_time: string | null
  clock_out_time: string | null
  is_late: boolean
}

export interface AttendanceSummary {
  employee: AttendanceEmployee
  period: {
    month: number
    year: number
    from: string
    to: string
  }
  summary: AttendanceSummaryData
  today: AttendanceTodayData | null
}
