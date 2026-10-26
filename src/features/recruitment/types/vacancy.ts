export type VacancyStatus = 'scheduled' | 'open' | 'closed'

export interface VacancyDepartmentRef {
  id: number
  name: string
}

export interface VacancyUserRef {
  id: number
  name: string
}

export interface Vacancy {
  id: number
  title: string
  department: VacancyDepartmentRef
  description: string
  required_headcount: number
  filled_headcount: number
  open_date: string
  target_hiring_date: string
  close_date: string | null
  status: VacancyStatus
  accepts_applications: boolean
  creator: VacancyUserRef
  created_at: string
  updated_at: string
}

export interface VacancySummary {
  scheduled_count: number
  open_count: number
  closed_count: number
  open_required_headcount: number
  open_filled_headcount: number
  overdue_open_count: number
}

export const EMPTY_VACANCY_SUMMARY: VacancySummary = {
  scheduled_count: 0,
  open_count: 0,
  closed_count: 0,
  open_required_headcount: 0,
  open_filled_headcount: 0,
  overdue_open_count: 0,
}

export interface VacancyListParams {
  search?: string
  department?: number
  status?: VacancyStatus
  target_hiring_date?: string
  per_page?: number
  page?: number
}

export interface VacancyPayload {
  title: string
  department_id: number | null
  description: string
  required_headcount: number
  open_date: string
  target_hiring_date: string
  close_date: string | null
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
