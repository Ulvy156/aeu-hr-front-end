export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export const WEEK_DAYS: { value: WeekDay; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export interface CompanySetting {
  id: number
  company_name: string
  company_logo: string | null
  company_logo_url: string | null
  company_address: string | null
  company_phone: string | null
  company_email: string | null
  office_latitude: number | null
  office_longitude: number | null
  allowed_radius_meters: number
  working_start_time: string
  working_end_time: string
  working_days: WeekDay[]
  salary_currency: string
  payroll_day_rate: number
  created_at: string
  updated_at: string
}

export interface CompanySettingForm {
  company_name: string
  company_address: string
  company_phone: string
  company_email: string
  office_latitude: string
  office_longitude: string
  allowed_radius_meters: number
  working_start_time: string
  working_end_time: string
  working_days: WeekDay[]
  salary_currency: string
  payroll_day_rate: number
}
