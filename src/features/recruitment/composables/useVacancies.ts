import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchVacancies } from '../services/vacancy.api'
import type { Vacancy, PaginationMeta, VacancyStatus } from '../types/vacancy'

export function useVacancies() {
  const notify = useNotify()
  const vacancies = ref<Vacancy[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    search: '',
    department: null as number | null,
    status: '' as VacancyStatus | '',
    target_hiring_date: '',
    page: 1,
    per_page: 15,
  })

  async function loadVacancies() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.search) params.search = filters.search
      if (filters.department) params.department = filters.department
      if (filters.status) params.status = filters.status
      if (filters.target_hiring_date) params.target_hiring_date = filters.target_hiring_date

      const res = await fetchVacancies(params)
      vacancies.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(
    search: string,
    department: number | null,
    status: VacancyStatus | '',
    targetHiringDate: string,
  ) {
    filters.search = search
    filters.department = department
    filters.status = status
    filters.target_hiring_date = targetHiringDate
    filters.page = 1
    loadVacancies()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadVacancies()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadVacancies()
  }

  return {
    vacancies,
    meta,
    loading,
    filters,
    loadVacancies,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
