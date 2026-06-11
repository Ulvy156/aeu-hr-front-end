export type AnnouncementStatus = 'draft' | 'pending_approval' | 'published' | 'rejected' | 'archived'
export type AnnouncementPriority = 'normal' | 'important' | 'urgent'
export type AnnouncementTargetType = 'all' | 'role' | 'department' | 'employee'
export type AnnouncementReadStatus = 'read' | 'unread'

export interface AnnouncementTarget {
  target_type: AnnouncementTargetType
  target_id: number | null
}

export interface AnnouncementCategoryRef {
  id: number
  name: string
}

export interface AnnouncementUserRef {
  id: number
  name: string
}

export interface AnnouncementAttachment {
  name: string
  size: number
  url: string
}

export interface AnnouncementReadEmployee {
  id: number
  employee_id: string
  full_name: string
}

export interface AnnouncementReadSummary {
  total_viewed: number
  total_unread: number
  viewed_employees: AnnouncementReadEmployee[]
  unread_employees: AnnouncementReadEmployee[]
}

export interface Announcement {
  id: number
  category: AnnouncementCategoryRef
  title: string
  content: string
  priority: AnnouncementPriority
  status: AnnouncementStatus
  attachment: AnnouncementAttachment | null
  targets: AnnouncementTarget[]
  creator: AnnouncementUserRef
  submitted_by_user: AnnouncementUserRef | null
  submitted_at: string | null
  approved_by_user: AnnouncementUserRef | null
  approved_at: string | null
  rejected_by_user: AnnouncementUserRef | null
  rejected_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Management-only (present on GET /announcements/{id} for users with announcements.view_draft)
  read_summary?: AnnouncementReadSummary
  // Employee-only (present on list/detail responses for users without announcements.view_draft)
  is_read?: boolean
}

export interface AnnouncementListParams {
  search?: string
  category?: number
  priority?: AnnouncementPriority
  status?: AnnouncementStatus
  created_by?: number
  read_status?: AnnouncementReadStatus
  per_page?: number
  page?: number
}

export interface AnnouncementFormPayload {
  category_id: number | null
  title: string
  content: string
  priority: AnnouncementPriority
  attachment: File | null
  remove_attachment?: boolean
  targets: AnnouncementTarget[]
}

export interface AnnouncementRejectPayload {
  rejection_reason: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
