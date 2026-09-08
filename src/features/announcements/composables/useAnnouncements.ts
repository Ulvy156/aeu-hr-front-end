import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { usePermission } from '@/composables/usePermissions'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  fetchAnnouncements,
  submitAnnouncement,
  cancelAnnouncementSubmission,
  approveAnnouncement,
  rejectAnnouncement,
  archiveAnnouncement,
} from '../services/announcement.api'
import {
  ANNOUNCEMENT_STATUS_VALUES,
  EMPTY_ANNOUNCEMENT_BOARD_COUNTS,
  EMPTY_ANNOUNCEMENT_STATUS_COUNTS,
  type Announcement,
  type AnnouncementBoardCounts,
  type AnnouncementListParams,
  type AnnouncementRejectPayload,
  type AnnouncementStatus,
  type AnnouncementStatusCounts,
  type PaginationMeta,
} from '../types/announcement'

export function useAnnouncements() {
  const notify = useNotify()
  const { can } = usePermission()
  const announcements = ref<Announcement[]>([])
  const statusCounts = ref<AnnouncementStatusCounts>({ ...EMPTY_ANNOUNCEMENT_STATUS_COUNTS })
  const boardCounts = ref<AnnouncementBoardCounts>({ ...EMPTY_ANNOUNCEMENT_BOARD_COUNTS })
  const pendingAnnouncement = ref<Announcement | null>(null)
  const latestRejected = ref<Announcement | null>(null)
  const featuredAnnouncement = ref<Announcement | null>(null)
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

  function overviewParams(overrides: AnnouncementListParams = {}): AnnouncementListParams {
    const params: AnnouncementListParams = {
      page: 1,
      per_page: 1,
      ...overrides,
    }
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category as number
    if (filters.priority && !overrides.priority) {
      params.priority = filters.priority as AnnouncementListParams['priority']
    }
    if (filters.created_by) params.created_by = filters.created_by as number
    return params
  }

  function listParams(): AnnouncementListParams {
    const params: AnnouncementListParams = {
      page: filters.page,
      per_page: filters.per_page,
    }
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category as number
    if (filters.priority) params.priority = filters.priority as AnnouncementListParams['priority']
    if (filters.status) params.status = filters.status as AnnouncementListParams['status']
    if (filters.created_by) params.created_by = filters.created_by as number
    if (filters.read_status) {
      params.read_status = filters.read_status as AnnouncementListParams['read_status']
    }
    return params
  }

  async function loadManagementOverview() {
    const results = await Promise.all(
      ANNOUNCEMENT_STATUS_VALUES.map((status) => fetchAnnouncements(overviewParams({ status }))),
    )

    const byStatus = Object.fromEntries(
      ANNOUNCEMENT_STATUS_VALUES.map((status, index) => [status, results[index]]),
    ) as Record<AnnouncementStatus, (typeof results)[number]>

    const counts: AnnouncementStatusCounts = { ...EMPTY_ANNOUNCEMENT_STATUS_COUNTS }
    for (const status of ANNOUNCEMENT_STATUS_VALUES) {
      counts[status] = byStatus[status]?.meta.total ?? 0
    }
    counts.all =
      counts.draft + counts.pending_approval + counts.published + counts.rejected + counts.archived
    statusCounts.value = counts
    pendingAnnouncement.value = byStatus.pending_approval?.data[0] ?? null
    latestRejected.value = byStatus.rejected?.data[0] ?? null
  }

  async function loadBoardOverview() {
    const [allRes, unreadRes, readRes, urgentRes, importantRes] = await Promise.all([
      fetchAnnouncements(overviewParams()),
      fetchAnnouncements(overviewParams({ read_status: 'unread' })),
      fetchAnnouncements(overviewParams({ read_status: 'read' })),
      fetchAnnouncements(overviewParams({ priority: 'urgent' })),
      fetchAnnouncements(overviewParams({ priority: 'important' })),
    ])

    boardCounts.value = {
      all: allRes.meta.total,
      unread: unreadRes.meta.total,
      read: readRes.meta.total,
      urgent_or_important: urgentRes.meta.total + importantRes.meta.total,
    }
    featuredAnnouncement.value = unreadRes.data[0] ?? allRes.data[0] ?? null
  }

  async function loadList() {
    const res = await fetchAnnouncements(listParams())
    announcements.value = res.data
    meta.value = res.meta
  }

  async function loadOverview() {
    if (can('announcements.view_draft')) {
      await loadManagementOverview()
      return
    }
    await loadBoardOverview()
  }

  async function loadAnnouncements() {
    loading.value = true
    try {
      const [listResult, overviewResult] = await Promise.allSettled([loadList(), loadOverview()])
      const failed = [listResult, overviewResult].find((result) => result.status === 'rejected')
      if (failed && failed.status === 'rejected') {
        notify.error(getApiErrorMessage(failed.reason))
      }
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

    if (featuredAnnouncement.value?.id === id) {
      const nextUnread = announcements.value.find((a) => a.id !== id && !a.is_read)
      featuredAnnouncement.value = nextUnread ?? { ...featuredAnnouncement.value, is_read: true }
    }

    if (boardCounts.value.unread > 0) {
      boardCounts.value = {
        ...boardCounts.value,
        unread: boardCounts.value.unread - 1,
        read: boardCounts.value.read + 1,
      }
    }
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
    statusCounts,
    boardCounts,
    pendingAnnouncement,
    latestRejected,
    featuredAnnouncement,
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
