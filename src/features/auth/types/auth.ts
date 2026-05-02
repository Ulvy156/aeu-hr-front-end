export interface AuthUser {
  id: number
  name: string
  email: string
  status: string
  roles: string[]
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
  device_name?: string
}

export interface LoginData {
  token: string
  token_type: string
  user: AuthUser
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
