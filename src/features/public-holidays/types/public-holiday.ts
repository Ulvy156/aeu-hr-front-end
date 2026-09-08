export type HolidayStatus = 'active' | 'inactive'

export interface PublicHoliday {
  id: number
  holiday_date: string
  name: string
  description: string | null
  status: HolidayStatus
  created_at: string
  updated_at: string
}

export interface PublicHolidayForm {
  holiday_date: string
  name: string
  description: string
  status: HolidayStatus
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface HolidayYearCounts {
  previous: number
  current: number
  next: number
  all: number
}

export interface HolidayStatusCounts {
  all: number
  active: number
  inactive: number
  within_30_days: number
}

export const EMPTY_HOLIDAY_YEAR_COUNTS: HolidayYearCounts = {
  previous: 0,
  current: 0,
  next: 0,
  all: 0,
}

export const EMPTY_HOLIDAY_STATUS_COUNTS: HolidayStatusCounts = {
  all: 0,
  active: 0,
  inactive: 0,
  within_30_days: 0,
}
