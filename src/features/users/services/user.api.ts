import api from '@/lib/axios'
import type {
  UserListItem,
  UserDetail,
  Role,
  Permission,
  UserListParams,
  PaginationMeta,
  CreateUserPayload,
  UpdateUserPayload,
  AssignRolesPayload,
} from '../types/user'

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

export async function fetchUsers(params: UserListParams = {}): Promise<PaginatedApiResponse<UserListItem>> {
  const { data } = await api.get('/users', { params })
  return data
}

export async function createUser(payload: CreateUserPayload): Promise<ApiResponse<UserListItem>> {
  const { data } = await api.post('/users', payload)
  return data
}

export async function fetchUser(id: number): Promise<ApiResponse<UserDetail>> {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<ApiResponse<UserListItem>> {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}

export async function deactivateUser(id: number): Promise<ApiResponse<UserListItem>> {
  const { data } = await api.delete(`/users/${id}`)
  return data
}

export async function assignUserRoles(id: number, payload: AssignRolesPayload): Promise<ApiResponse<UserListItem>> {
  const { data } = await api.put(`/users/${id}/roles`, payload)
  return data
}

export async function fetchRoles(): Promise<ApiResponse<Role[]>> {
  const { data } = await api.get('/roles')
  return data
}

export async function fetchPermissions(): Promise<ApiResponse<Permission[]>> {
  const { data } = await api.get('/permissions')
  return data
}
