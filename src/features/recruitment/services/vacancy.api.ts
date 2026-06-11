import api from '@/lib/axios'
import type { Vacancy, VacancyListParams, VacancyPayload, PaginationMeta } from '../types/vacancy'

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

export async function fetchVacancies(
  params: VacancyListParams = {},
): Promise<PaginatedApiResponse<Vacancy>> {
  const { data } = await api.get('/recruitment/vacancies', { params })
  return data
}

export async function fetchVacancy(id: number): Promise<ApiResponse<Vacancy>> {
  const { data } = await api.get(`/recruitment/vacancies/${id}`)
  return data
}

export async function createVacancy(payload: VacancyPayload): Promise<ApiResponse<Vacancy>> {
  const { data } = await api.post('/recruitment/vacancies', payload)
  return data
}

export async function updateVacancy(
  id: number,
  payload: VacancyPayload,
): Promise<ApiResponse<Vacancy>> {
  const { data } = await api.put(`/recruitment/vacancies/${id}`, payload)
  return data
}

export async function closeVacancy(id: number): Promise<ApiResponse<Vacancy>> {
  const { data } = await api.post(`/recruitment/vacancies/${id}/close`)
  return data
}
