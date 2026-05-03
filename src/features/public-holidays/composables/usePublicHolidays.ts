import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchPublicHolidays } from '../services/public-holiday.api'
import type { PublicHoliday, PaginationMeta } from '../types/public-holiday'

export function usePublicHolidays() {
  const holidays = ref<PublicHoliday[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    search: '',
    status: '',
    year: '',
    page: 1,
    per_page: 15,
  })

  async function loadHolidays() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.year) params.year = filters.year

      const res = await fetchPublicHolidays(params)
      holidays.value = res.data
      meta.value = res.meta
    } catch {
      ElMessage.error('Failed to load public holidays.')
    } finally {
      loading.value = false
    }
  }

  function applyFilters(search: string, status: string, year: string) {
    filters.search = search
    filters.status = status
    filters.year = year
    filters.page = 1
    loadHolidays()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadHolidays()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadHolidays()
  }

  return {
    holidays,
    meta,
    loading,
    filters,
    loadHolidays,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
