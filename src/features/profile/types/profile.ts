export interface ProfileDepartment {
  id: number
  name: string
}

export interface ProfilePosition {
  id: number
  name: string
}

export interface ProfileEmployee {
  id: number
  employee_id: string
  full_name: string
  gender: string | null
  date_of_birth: string | null
  phone_number: string | null
  email: string | null
  address: string | null
  department: ProfileDepartment | null
  position: ProfilePosition | null
  join_date: string | null
  last_working_date: string | null
  employment_status: string | null
  profile_photo_url: string | null
}

export interface ProfileUser {
  id: number
  name: string
  email: string
  status: string
  roles: string[]
  permissions: string[]
  employee: ProfileEmployee | null
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}
