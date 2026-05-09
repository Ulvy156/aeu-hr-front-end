import api from '@/lib/axios'
import type { Employee, EmployeeListParams, PaginationMeta } from '../types/employee'

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

export async function fetchEmployees(
  params: EmployeeListParams = {},
): Promise<PaginatedApiResponse<Employee>> {
  const { data } = await api.get('/employees', { params })
  return data
}

export async function createEmployee(fd: FormData): Promise<ApiResponse<Employee>> {
  const { data } = await api.post('/employees', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function fetchEmployee(id: number): Promise<ApiResponse<Employee>> {
  const { data } = await api.get(`/employees/${id}`)
  return data
}

export async function updateEmployee(id: number, fd: FormData): Promise<ApiResponse<Employee>> {
  fd.append('_method', 'PUT')
  const { data } = await api.post(`/employees/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteEmployee(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/employees/${id}`)
  return data
}

export interface EmployeeSearchOption {
  employee_id: string
  full_name: string
  display: string
}

export async function searchEmployees(q: string): Promise<EmployeeSearchOption[]> {
  const { data } = await api.get('/employees/search', { params: { q } })
  return data
}
