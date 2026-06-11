import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  fetchAnnouncements,
  submitAnnouncement,
  cancelAnnouncementSubmission,
  approveAnnouncement,
  rejectAnnouncement,
  archiveAnnouncement,
} from '../services/announcement.api'
import type {
  Announcement,
  AnnouncementListParams,
  AnnouncementRejectPayload,
  PaginationMeta,
} from '../types/announcement'

export function useAnnouncements() {
  const notify = useNotify()
  const announcements = ref<Announcement[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const actionLoading = ref(false)

  const filters = reactive({
    search: '',
    category: '' as number | '',
    priority: '',
    status: '',
    created_by: '' as number | '',
    read_status: '',
    page: 1,
    per_page: 15,
  })

  async function loadAnnouncements() {
    loading.value = true
    try {
      const params: AnnouncementListParams = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category as number
      if (filters.priority) params.priority = filters.priority as AnnouncementListParams['priority']
      if (filters.status) params.status = filters.status as AnnouncementListParams['status']
      if (filters.created_by) params.created_by = filters.created_by as number
      if (filters.read_status) params.read_status = filters.read_status as AnnouncementListParams['read_status']

      const res = await fetchAnnouncements(params)
      announcements.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(next: Partial<Omit<typeof filters, 'page' | 'per_page'>>) {
    Object.assign(filters, {
      search: '',
      category: '',
      priority: '',
      status: '',
      created_by: '',
      read_status: '',
      ...next,
    })
    filters.page = 1
    loadAnnouncements()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadAnnouncements()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadAnnouncements()
  }

  function markLocalAsRead(id: number) {
    const item = announcements.value.find((a) => a.id === id)
    if (item) item.is_read = true
  }

  async function handleSubmit(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await submitAnnouncement(id)
      notify.success('Announcement submitted for approval.')
      await loadAnnouncements()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleCancelSubmission(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await cancelAnnouncementSubmission(id)
      notify.success('Submission cancelled. Announcement returned to draft.')
      await loadAnnouncements()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleApprove(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await approveAnnouncement(id)
      notify.success('Announcement approved and published.')
      await loadAnnouncements()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleReject(id: number, payload: AnnouncementRejectPayload): Promise<boolean> {
    actionLoading.value = true
    try {
      await rejectAnnouncement(id, payload)
      notify.success('Announcement rejected.')
      await loadAnnouncements()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleArchive(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await archiveAnnouncement(id)
      notify.success('Announcement archived.')
      await loadAnnouncements()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  return {
    announcements,
    meta,
    loading,
    actionLoading,
    filters,
    loadAnnouncements,
    applyFilters,
    onPageChange,
    onPageSizeChange,
    markLocalAsRead,
    handleSubmit,
    handleCancelSubmission,
    handleApprove,
    handleReject,
    handleArchive,
  }
}
