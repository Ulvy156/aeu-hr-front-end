import api from '@/lib/axios'
import type { PublicHoliday, PublicHolidayForm, PaginationMeta } from '../types/public-holiday'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

export async function fetchPublicHolidays(
  params: Record<string, unknown> = {},
): Promise<PaginatedApiResponse<PublicHoliday>> {
  const { data } = await api.get('/public-holidays', { params })
  return data
}

export async function createPublicHoliday(
  payload: PublicHolidayForm,
): Promise<ApiResponse<PublicHoliday>> {
  const { data } = await api.post('/public-holidays', payload)
  return data
}

export async function updatePublicHoliday(
  id: number,
  payload: PublicHolidayForm,
): Promise<ApiResponse<PublicHoliday>> {
  const { data } = await api.put(`/public-holidays/${id}`, payload)
  return data
}

export async function disablePublicHoliday(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/public-holidays/${id}`)
  return data
}
