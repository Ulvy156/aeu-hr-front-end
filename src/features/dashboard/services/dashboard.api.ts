import api from '@/lib/axios'
import type {
  EmployeeDashboardData,
  HrDashboardData,
  CeoDashboardData,
  AdminDashboardData,
} from '../types/dashboard'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getEmployeeDashboard(): Promise<ApiResponse<EmployeeDashboardData>> {
  const { data } = await api.get('/dashboard/employee')
  return data
}

export async function getHrDashboard(): Promise<ApiResponse<HrDashboardData>> {
  const { data } = await api.get('/dashboard/hr')
  return data
}

export async function getCeoDashboard(): Promise<ApiResponse<CeoDashboardData>> {
  const { data } = await api.get('/dashboard/ceo')
  return data
}

export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboardData>> {
  const { data } = await api.get('/dashboard/admin')
  return data
}
