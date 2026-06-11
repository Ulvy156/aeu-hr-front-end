import api from '@/lib/axios'
import type {
  Announcement,
  AnnouncementFormPayload,
  AnnouncementListParams,
  AnnouncementRejectPayload,
  PaginationMeta,
} from '../types/announcement'

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

function toJsonPayload(payload: AnnouncementFormPayload) {
  return {
    category_id: payload.category_id,
    title: payload.title,
    content: payload.content,
    priority: payload.priority,
    targets: payload.targets,
  }
}

function toFormData(payload: AnnouncementFormPayload): FormData {
  const fd = new FormData()
  fd.append('category_id', String(payload.category_id ?? ''))
  fd.append('title', payload.title)
  fd.append('content', payload.content)
  fd.append('priority', payload.priority)
  payload.targets.forEach((target, index) => {
    fd.append(`targets[${index}][target_type]`, target.target_type)
    if (target.target_id !== null && target.target_id !== undefined) {
      fd.append(`targets[${index}][target_id]`, String(target.target_id))
    }
  })
  if (payload.attachment instanceof File) {
    fd.append('attachment', payload.attachment)
  }
  return fd
}

export async function fetchAnnouncements(
  params: AnnouncementListParams = {},
): Promise<PaginatedApiResponse<Announcement>> {
  const { data } = await api.get('/announcements', { params })
  return data
}

export async function fetchAnnouncement(id: number): Promise<ApiResponse<Announcement>> {
  const { data } = await api.get(`/announcements/${id}`)
  return data
}

export async function createAnnouncement(
  payload: AnnouncementFormPayload,
): Promise<ApiResponse<Announcement>> {
  if (payload.attachment instanceof File) {
    const fd = toFormData(payload)
    const { data } = await api.post('/announcements', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }
  const { data } = await api.post('/announcements', toJsonPayload(payload))
  return data
}

export async function updateAnnouncement(
  id: number,
  payload: AnnouncementFormPayload,
): Promise<ApiResponse<Announcement>> {
  if (payload.attachment instanceof File) {
    const fd = toFormData(payload)
    fd.append('_method', 'PUT')
    const { data } = await api.post(`/announcements/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }
  const body: Record<string, unknown> = toJsonPayload(payload)
  if (payload.remove_attachment) body.remove_attachment = true
  const { data } = await api.put(`/announcements/${id}`, body)
  return data
}

export async function submitAnnouncement(id: number): Promise<ApiResponse<Announcement>> {
  const { data } = await api.post(`/announcements/${id}/submit`)
  return data
}

export async function cancelAnnouncementSubmission(id: number): Promise<ApiResponse<Announcement>> {
  const { data } = await api.post(`/announcements/${id}/cancel-submission`)
  return data
}

export async function approveAnnouncement(id: number): Promise<ApiResponse<Announcement>> {
  const { data } = await api.post(`/announcements/${id}/approve`)
  return data
}

export async function rejectAnnouncement(
  id: number,
  payload: AnnouncementRejectPayload,
): Promise<ApiResponse<Announcement>> {
  const { data } = await api.post(`/announcements/${id}/reject`, payload)
  return data
}

export async function archiveAnnouncement(id: number): Promise<ApiResponse<Announcement>> {
  const { data } = await api.post(`/announcements/${id}/archive`)
  return data
}

export async function markAnnouncementRead(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.post(`/announcements/${id}/read`)
  return data
}
