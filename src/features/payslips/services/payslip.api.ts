import api from '@/lib/axios'
import type { Payslip, PaginationMeta } from '../types/payslip'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

export async function fetchPayslips(
  params: Record<string, unknown> = {},
): Promise<PaginatedResponse<Payslip>> {
  const { data } = await api.get('/payslips', { params })
  return data
}

export async function fetchPayslip(id: number): Promise<ApiResponse<Payslip>> {
  const { data } = await api.get(`/payslips/${id}`)
  return data
}

export async function downloadPayslip(id: number): Promise<void> {
  const response = await api.get(`/payslips/${id}/download`, {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payslip-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
