import api from '@/lib/axios'
import type {
  Candidate,
  CandidateListParams,
  CandidateFormPayload,
  CandidateStatusPayload,
  PaginationMeta,
} from '../types/candidate'

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

function toFormData(payload: CandidateFormPayload, includeVacancyId: boolean): FormData {
  const fd = new FormData()
  if (includeVacancyId && payload.vacancy_id !== null) {
    fd.append('vacancy_id', String(payload.vacancy_id))
  }
  fd.append('full_name', payload.full_name)
  fd.append('phone', payload.phone)
  if (payload.email) fd.append('email', payload.email)
  fd.append('source', payload.source)
  if (payload.cv instanceof File) fd.append('cv', payload.cv)
  if (payload.interview_date) fd.append('interview_date', payload.interview_date)
  if (payload.interviewer_id !== null) fd.append('interviewer_id', String(payload.interviewer_id))
  if (payload.notes) fd.append('notes', payload.notes)
  return fd
}

export async function fetchCandidates(
  params: CandidateListParams = {},
): Promise<PaginatedApiResponse<Candidate>> {
  const { data } = await api.get('/recruitment/candidates', { params })
  return data
}

export async function fetchCandidate(id: number): Promise<ApiResponse<Candidate>> {
  const { data } = await api.get(`/recruitment/candidates/${id}`)
  return data
}

export async function createCandidate(
  payload: CandidateFormPayload,
): Promise<ApiResponse<Candidate>> {
  const fd = toFormData(payload, true)
  const { data } = await api.post('/recruitment/candidates', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateCandidate(
  id: number,
  payload: CandidateFormPayload,
): Promise<ApiResponse<Candidate>> {
  if (payload.cv instanceof File) {
    const fd = toFormData(payload, false)
    fd.append('_method', 'PUT')
    const { data } = await api.post(`/recruitment/candidates/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  const body = {
    full_name: payload.full_name,
    phone: payload.phone,
    email: payload.email,
    source: payload.source,
    interview_date: payload.interview_date,
    interviewer_id: payload.interviewer_id,
    notes: payload.notes,
  }
  const { data } = await api.put(`/recruitment/candidates/${id}`, body)
  return data
}

export async function updateCandidateStatus(
  id: number,
  payload: CandidateStatusPayload,
): Promise<ApiResponse<Candidate>> {
  const { data } = await api.post(`/recruitment/candidates/${id}/status`, payload)
  return data
}
