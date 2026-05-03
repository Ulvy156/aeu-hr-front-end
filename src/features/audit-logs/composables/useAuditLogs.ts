import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchAuditLogs } from '../services/audit-log.api'
import type { AuditLog, AuditLogFilterState, PaginationMeta } from '../types/audit-log'

export function useAuditLogs() {
  const notify = useNotify()
  const logs = ref<AuditLog[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)

  const filters = reactive<AuditLogFilterState & { page: number; per_page: number }>({
    userId: null,
    module: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    per_page: 15,
  })

  async function loadLogs() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.userId) params.user_id = filters.userId
      if (filters.module) params.module = filters.module
      if (filters.action) params.action = filters.action
      if (filters.dateFrom) params.date_from = filters.dateFrom
      if (filters.dateTo) params.date_to = filters.dateTo

      const res = await fetchAuditLogs(params)
      logs.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(f: AuditLogFilterState) {
    filters.userId = f.userId
    filters.module = f.module
    filters.action = f.action
    filters.dateFrom = f.dateFrom
    filters.dateTo = f.dateTo
    filters.page = 1
    loadLogs()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadLogs()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadLogs()
  }

  return {
    logs,
    meta,
    loading,
    filters,
    loadLogs,
    applyFilters,
    onPageChange,
    onPageSizeChange,
  }
}
