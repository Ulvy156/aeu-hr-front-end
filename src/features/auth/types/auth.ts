export interface AuthEmployee {
  id: number
  employee_id: string
  full_name: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  status: string
  roles: string[]
  permissions: string[]
  employee: AuthEmployee | null
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
  device_name?: string
}

export interface LoginData {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface RefreshData {
  access_token: string
  token_type: string
  expires_in: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
