import api from '@/lib/axios'
import type {
  Department,
  DepartmentListParams,
  PaginationMeta,
  DepartmentPayload,
} from '../types/department'

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

export async function fetchDepartments(
  params: DepartmentListParams = {},
): Promise<PaginatedApiResponse<Department>> {
  const { data } = await api.get('/departments', { params })
  return data
}

export async function createDepartment(
  payload: DepartmentPayload,
): Promise<ApiResponse<Department>> {
  const { data } = await api.post('/departments', payload)
  return data
}

export async function fetchDepartment(id: number): Promise<ApiResponse<Department>> {
  const { data } = await api.get(`/departments/${id}`)
  return data
}

export async function updateDepartment(
  id: number,
  payload: DepartmentPayload,
): Promise<ApiResponse<Department>> {
  const { data } = await api.put(`/departments/${id}`, payload)
  return data
}

export async function deleteDepartment(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/departments/${id}`)
  return data
}
