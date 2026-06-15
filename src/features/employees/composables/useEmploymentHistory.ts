import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchEmploymentHistory } from '../services/employment-history.api'
import type {
  EmploymentHistoryEntry,
  EmploymentHistoryField,
  EmploymentHistoryListParams,
  PaginationMeta,
} from '../types/employment-history'

export function useEmploymentHistory() {
  const notify = useNotify()
  const entries = ref<EmploymentHistoryEntry[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive({
    field: '' as EmploymentHistoryField | '',
    page: 1,
    per_page: 10,
  })

  let employeeId: number | null = null

  async function loadHistory(id: number) {
    employeeId = id
    loading.value = true
    try {
      const params: EmploymentHistoryListParams = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.field) params.field = filters.field

      const res = await fetchEmploymentHistory(id, params)
      entries.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function onFieldChange(field: EmploymentHistoryField | '') {
    filters.field = field
    filters.page = 1
    if (employeeId) loadHistory(employeeId)
  }

  function onPageChange(page: number) {
    filters.page = page
    if (employeeId) loadHistory(employeeId)
  }

  return {
    entries,
    meta,
    loading,
    filters,
    loadHistory,
    onFieldChange,
    onPageChange,
  }
}
