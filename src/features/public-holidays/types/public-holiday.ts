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
