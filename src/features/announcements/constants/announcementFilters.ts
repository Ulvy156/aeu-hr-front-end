import type { AnnouncementPriority, AnnouncementStatus } from '../types/announcement'

export const ANNOUNCEMENT_PRIORITY_OPTIONS: { label: string; value: AnnouncementPriority }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Important', value: 'important' },
  { label: 'Urgent', value: 'urgent' },
]

export const ANNOUNCEMENT_STATUS_PILLS: {
  value: AnnouncementStatus | ''
  label: string
  countKey: 'all' | AnnouncementStatus
}[] = [
  { value: '', label: 'All', countKey: 'all' },
  { value: 'draft', label: 'Draft', countKey: 'draft' },
  { value: 'pending_approval', label: 'Pending', countKey: 'pending_approval' },
  { value: 'published', label: 'Published', countKey: 'published' },
  { value: 'rejected', label: 'Rejected', countKey: 'rejected' },
  { value: 'archived', label: 'Archived', countKey: 'archived' },
]
