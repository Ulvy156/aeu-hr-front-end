import api from '@/lib/axios'
import type {
  AnnouncementCategory,
  AnnouncementCategoryListParams,
  AnnouncementCategoryPayload,
  PaginationMeta,
} from '../types/announcement-category'

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

export async function fetchAnnouncementCategories(
  params: AnnouncementCategoryListParams = {},
): Promise<PaginatedApiResponse<AnnouncementCategory>> {
  const { data } = await api.get('/announcement-categories', { params })
  return data
}

export async function fetchAnnouncementCategory(
  id: number,
): Promise<ApiResponse<AnnouncementCategory>> {
  const { data } = await api.get(`/announcement-categories/${id}`)
  return data
}

export async function createAnnouncementCategory(
  payload: AnnouncementCategoryPayload,
): Promise<ApiResponse<AnnouncementCategory>> {
  const { data } = await api.post('/announcement-categories', payload)
  return data
}

export async function updateAnnouncementCategory(
  id: number,
  payload: AnnouncementCategoryPayload,
): Promise<ApiResponse<AnnouncementCategory>> {
  const { data } = await api.put(`/announcement-categories/${id}`, payload)
  return data
}

export async function deactivateAnnouncementCategory(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/announcement-categories/${id}`)
  return data
}
