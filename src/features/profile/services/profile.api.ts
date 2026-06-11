import api from '@/lib/axios'
import type { ChangePasswordPayload, ProfileUser } from '../types/profile'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getProfile(): Promise<ApiResponse<ProfileUser>> {
  const { data } = await api.get('/profile')
  return data
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<null>> {
  const { data } = await api.post('/profile/change-password', payload)
  return data
}
