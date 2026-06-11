export type AnnouncementCategoryStatus = 'active' | 'inactive'

export interface AnnouncementCategory {
  id: number
  name: string
  description: string | null
  status: AnnouncementCategoryStatus
  created_at: string
  updated_at: string
}

export interface AnnouncementCategoryListParams {
  search?: string
  status?: AnnouncementCategoryStatus
  per_page?: number
  page?: number
}

export interface AnnouncementCategoryPayload {
  name: string
  description: string | null
  status: AnnouncementCategoryStatus
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
