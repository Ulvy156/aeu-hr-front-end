import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchAttendance } from '../services/attendance.api'
import type { Attendance, PaginationMeta } from '../types/attendance'

export function useAttendance() {
  const notify = useNotify()
  const attendances = ref<Attendance[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    date_from: '',
    date_to: '',
    status: '',
    page: 1,
    per_page: 15,
  })

  async function loadAttendance() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.status) params.status = filters.status

      const res = await fetchAttendance(params)
      attendances.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(dateFrom: string, dateTo: string, status: string) {
    filters.date_from = dateFrom
    filters.date_to = dateTo
    filters.status = status
    filters.page = 1
    loadAttendance()
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
    filters,
    loadAttendance,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
