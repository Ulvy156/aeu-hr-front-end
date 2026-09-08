import { ref, reactive, computed } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchPublicHolidays } from '../services/public-holiday.api'
import {
  EMPTY_HOLIDAY_STATUS_COUNTS,
  EMPTY_HOLIDAY_YEAR_COUNTS,
  type HolidayStatus,
  type HolidayStatusCounts,
  type HolidayYearCounts,
  type PublicHoliday,
  type PaginationMeta,
} from '../types/public-holiday'
import {
  isSoonHoliday,
  isUpcomingHoliday,
  sortHolidaysByDate,
} from '../utils/holidayDisplay'

const CURRENT_YEAR = new Date().getFullYear()

export function usePublicHolidays() {
  const notify = useNotify()
  const holidays = ref<PublicHoliday[]>([])
  const upcomingHolidays = ref<PublicHoliday[]>([])
  const yearCounts = ref<HolidayYearCounts>({ ...EMPTY_HOLIDAY_YEAR_COUNTS })
  const statusCounts = ref<HolidayStatusCounts>({ ...EMPTY_HOLIDAY_STATUS_COUNTS })
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    search: '',
    status: '' as HolidayStatus | '',
    year: String(CURRENT_YEAR),
    page: 1,
    per_page: 15,
  })

  const nextHoliday = computed(() => upcomingHolidays.value[0] ?? null)

  const soonHolidays = computed(() => upcomingHolidays.value.filter(isSoonHoliday))

  function countParams(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      page: 1,
      per_page: 1,
      ...overrides,
    }
  }

  async function loadYearCounts() {
    const [previous, current, next, all] = await Promise.all([
      fetchPublicHolidays(countParams({ year: CURRENT_YEAR - 1 })),
      fetchPublicHolidays(countParams({ year: CURRENT_YEAR })),
      fetchPublicHolidays(countParams({ year: CURRENT_YEAR + 1 })),
      fetchPublicHolidays(countParams()),
    ])

    yearCounts.value = {
      previous: previous.meta.total,
      current: current.meta.total,
      next: next.meta.total,
      all: all.meta.total,
    }
  }

  async function loadStatusCounts() {
    const year = filters.year ? Number(filters.year) : undefined
    const base: Record<string, unknown> = {}
    if (year) base.year = year
    if (filters.search) base.search = filters.search

    const [all, active, inactive] = await Promise.all([
      fetchPublicHolidays(countParams(base)),
      fetchPublicHolidays(countParams({ ...base, status: 'active' })),
      fetchPublicHolidays(countParams({ ...base, status: 'inactive' })),
    ])

    statusCounts.value = {
      all: all.meta.total,
      active: active.meta.total,
      inactive: inactive.meta.total,
      within_30_days: statusCounts.value.within_30_days,
    }
  }

  async function loadUpcoming() {
    const res = await fetchPublicHolidays({
      status: 'active',
      per_page: 100,
      page: 1,
    })
    const upcoming = sortHolidaysByDate(res.data.filter((row) => isUpcomingHoliday(row, 90)))
    upcomingHolidays.value = upcoming
    statusCounts.value = {
      ...statusCounts.value,
      within_30_days: upcoming.filter(isSoonHoliday).length,
    }
  }

  async function loadList() {
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
  }

  async function loadHolidays(includeOverview = true) {
    loading.value = true
    try {
      if (includeOverview) {
        const results = await Promise.allSettled([
          loadList(),
          loadYearCounts(),
          loadStatusCounts().then(() => loadUpcoming()),
        ])
        const failed = results.find((result) => result.status === 'rejected')
        if (failed && failed.status === 'rejected') {
          notify.error(getApiErrorMessage(failed.reason))
        }
      } else {
        const results = await Promise.allSettled([loadList(), loadStatusCounts()])
        const failed = results.find((result) => result.status === 'rejected')
        if (failed && failed.status === 'rejected') {
          notify.error(getApiErrorMessage(failed.reason))
        }
      }
    } finally {
      loading.value = false
    }
  }

  function applyFilters(search: string, status: HolidayStatus | '', year: string) {
    filters.search = search
    filters.status = status
    filters.year = year
    filters.page = 1
    loadHolidays(false)
  }

  function onPageChange(page: number) {
    filters.page = page
    loadList().catch((err) => notify.error(getApiErrorMessage(err)))
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadList().catch((err) => notify.error(getApiErrorMessage(err)))
  }

  return {
    holidays,
    upcomingHolidays,
    nextHoliday,
    soonHolidays,
    yearCounts,
    statusCounts,
    currentYear: CURRENT_YEAR,
    meta,
    loading,
    filters,
    loadHolidays,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
