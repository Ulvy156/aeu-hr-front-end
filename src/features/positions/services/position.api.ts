import api from '@/lib/axios'
import type {
  Position,
  PositionListParams,
  PaginationMeta,
  PositionPayload,
} from '../types/position'

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

export async function fetchPositions(
  params: PositionListParams = {},
): Promise<PaginatedApiResponse<Position>> {
  const { data } = await api.get('/positions', { params })
  return data
}

export async function createPosition(
  payload: PositionPayload,
): Promise<ApiResponse<Position>> {
  const { data } = await api.post('/positions', payload)
  return data
}

export async function fetchPosition(id: number): Promise<ApiResponse<Position>> {
  const { data } = await api.get(`/positions/${id}`)
  return data
}

export async function updatePosition(
  id: number,
  payload: PositionPayload,
): Promise<ApiResponse<Position>> {
  const { data } = await api.put(`/positions/${id}`, payload)
  return data
}

export async function deletePosition(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/positions/${id}`)
  return data
}
