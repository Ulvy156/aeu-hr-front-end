import { reactive, ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchAttendance } from '../services/attendance.api'
import type {
  Attendance,
  AttendanceCorrectionFilters,
  CorrectionQueue,
  CorrectionQueueCounts,
  PaginationMeta,
} from '../types/attendance'
import { CORRECTION_QUEUE_STATUS } from '../types/attendance'

function emptyCounts(): CorrectionQueueCounts {
  return { needs_review: 0, late: 0, absent: 0, all: 0 }
}

export function useAttendanceCorrection() {
  const notify = useNotify()
  const attendances = ref<Attendance[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const countsLoading = ref(false)
  const counts = reactive<CorrectionQueueCounts>(emptyCounts())

  const filters = reactive<AttendanceCorrectionFilters>({
    queue: 'needs_review',
    employee_id: null,
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 15,
  })

  function sharedParams(): Record<string, unknown> {
    const params: Record<string, unknown> = {}
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.employee_id) params.employee_id = filters.employee_id
    return params
  }

  async function loadAttendance() {
    loading.value = true
    try {
      const status = CORRECTION_QUEUE_STATUS[filters.queue]
      const params: Record<string, unknown> = {
        ...sharedParams(),
        page: filters.page,
        per_page: filters.per_page,
      }
      if (status) params.status = status

      const res = await fetchAttendance(params)
      attendances.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  async function loadCounts() {
    countsLoading.value = true
    try {
      const shared = { ...sharedParams(), page: 1, per_page: 1 }
      const [needsReview, late, absent, all] = await Promise.all([
        fetchAttendance({ ...shared, status: 'missing_clock_out' }),
        fetchAttendance({ ...shared, status: 'late' }),
        fetchAttendance({ ...shared, status: 'absent' }),
        fetchAttendance(shared),
      ])
      counts.needs_review = needsReview.meta.total
      counts.late = late.meta.total
      counts.absent = absent.meta.total
      counts.all = all.meta.total
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      countsLoading.value = false
    }
  }

  function setQueue(queue: CorrectionQueue) {
    if (filters.queue === queue) return
    filters.queue = queue
    filters.page = 1
    loadAttendance()
  }

  function applyFilters(employeeId: number | null, dateFrom: string, dateTo: string) {
    filters.employee_id = employeeId
    filters.date_from = dateFrom
    filters.date_to = dateTo
    filters.page = 1
    loadAttendance()
    loadCounts()
  }

  function resetFilters() {
    filters.queue = 'needs_review'
    filters.employee_id = null
    filters.date_from = ''
    filters.date_to = ''
    filters.page = 1
    loadAttendance()
    loadCounts()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadAttendance()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadAttendance()
  }

  return {
    attendances,
    meta,
    loading,
    counts,
    countsLoading,
    filters,
    loadAttendance,
    loadCounts,
    setQueue,
    applyFilters,
    resetFilters,
    onPageChange,
    onPageSizeChange,
  }
}
