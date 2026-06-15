import api from '@/lib/axios'
import type { EmployeeHierarchyNode } from '../types/employee-hierarchy'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function fetchEmployeeHierarchy(): Promise<ApiResponse<EmployeeHierarchyNode[]>> {
  const { data } = await api.get('/employees/hierarchy')
  return data
}
