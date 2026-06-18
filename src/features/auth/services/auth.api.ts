import api from '@/lib/axios'
import type { ApiResponse, AuthUser, LoginData, LoginRequest, RefreshData } from '@/features/auth/types/auth'

export async function login(credentials: LoginRequest): Promise<LoginData> {
  const res = await api.post<ApiResponse<LoginData>>('/login', {
    email: credentials.email,
    password: credentials.password,
    device_name: credentials.device_name ?? 'web-client',
  })
  return res.data.data
}

export async function refreshToken(): Promise<RefreshData> {
  const res = await api.post<ApiResponse<RefreshData>>('/refresh')
  return res.data.data
}

export async function logout(): Promise<void> {
  await api.post('/logout')
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await api.get<ApiResponse<AuthUser>>('/me')
  return res.data.data
}
