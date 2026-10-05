import { stripHtml } from '@/utils/sanitizeHtml'
import type {
  Announcement,
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementTarget,
} from '../types/announcement'

export function formatAnnouncementDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function announcementStatusLabel(status: AnnouncementStatus): string {
  if (status === 'pending_approval') return 'Ready to publish'
  if (status === 'draft') return 'Draft'
  if (status === 'published') return 'Published'
  if (status === 'rejected') return 'Rejected'
  return 'Archived'
}

export function announcementPriorityLabel(priority: AnnouncementPriority): string {
  if (priority === 'urgent') return 'Urgent'
  if (priority === 'important') return 'Important'
  return 'Normal'
}

export function audienceLabel(targets: AnnouncementTarget[] | undefined): string {
  if (!targets?.length) return '—'
  if (targets.length === 1 && targets[0]?.target_type === 'all') return 'Everyone'
  const types = targets.map((target) => {
    if (target.target_type === 'role') return 'Role'
    if (target.target_type === 'department') return 'Department'
    if (target.target_type === 'employee') return 'Employee'
    return 'Everyone'
  })
  return `Targeted · ${types.join(' · ')}`
}

export function announcementTimeline(announcement: Announcement): string {
  if (announcement.status === 'published' && (announcement.published_at || announcement.approved_at)) {
    return `Published ${formatAnnouncementDate(announcement.published_at ?? announcement.approved_at)}`
  }
  if (announcement.status === 'rejected' && announcement.rejected_at) {
    return `Rejected ${formatAnnouncementDate(announcement.rejected_at)}`
  }
  if (announcement.status === 'archived' && (announcement.published_at || announcement.approved_at)) {
    return `Archived · published ${formatAnnouncementDate(announcement.published_at ?? announcement.approved_at)}`
  }
  return `Created ${formatAnnouncementDate(announcement.created_at)}`
}

export function announcementExcerpt(content: string, maxLength = 160): string {
  const text = stripHtml(content)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export function needsAttention(announcement: Announcement): boolean {
  return (
    announcement.status === 'draft' ||
    announcement.status === 'pending_approval' ||
    announcement.status === 'rejected'
  )
}

export function postedOn(announcement: Announcement): string {
  return formatAnnouncementDate(announcement.published_at ?? announcement.approved_at ?? announcement.created_at)
}
