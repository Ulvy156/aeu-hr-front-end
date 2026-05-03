import api from '@/lib/axios'
import type { ProfileUser } from '../types/profile'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getProfile(): Promise<ApiResponse<ProfileUser>> {
  const { data } = await api.get('/profile')
  return data
}
