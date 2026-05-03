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
  UserSummary,
  UserPermissionsResponse,
  SyncUserPermissionsPayload,
  AddUserPermissionPayload,
  RemoveUserPermissionPayload,
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

export async function getUserPermissions(userId: number): Promise<ApiResponse<UserPermissionsResponse>> {
  const { data } = await api.get(`/users/${userId}/permissions`)
  return data
}

export async function syncUserPermissions(
  userId: number,
  payload: SyncUserPermissionsPayload,
): Promise<ApiResponse<UserPermissionsResponse>> {
  const { data } = await api.put(`/users/${userId}/permissions`, payload)
  return data
}

export async function addUserPermission(
  userId: number,
  payload: AddUserPermissionPayload,
): Promise<ApiResponse<UserPermissionsResponse>> {
  const { data } = await api.post(`/users/${userId}/permissions`, payload)
  return data
}

export async function removeUserPermission(
  userId: number,
  payload: RemoveUserPermissionPayload,
): Promise<ApiResponse<UserPermissionsResponse>> {
  const { data } = await api.delete(`/users/${userId}/permissions`, { data: payload })
  return data
}

export async function fetchUserSummary(): Promise<ApiResponse<UserSummary>> {
  const { data } = await api.get('/dashboard/users-summary')
  return data
}