import { ref } from 'vue'
import { useNotify } from './useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type { PaginationMeta, ReportResponse } from '@/features/reports/types/report'

type FetchFn = (params: Record<string, unknown>) => Promise<ReportResponse<unknown>>
type ExportFn = (params: Record<string, unknown>) => Promise<void>

export function useReport(fetchFn: FetchFn, exportFn: ExportFn) {
  const notify = useNotify()
  const items = ref<unknown[]>([])
  const summary = ref<Record<string, unknown>>({})
  const reportType = ref('')
  const meta = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const exportLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadReport(params: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchFn(params)
      items.value = res.data.items ?? []
      summary.value = res.data.summary ?? {}
      reportType.value = res.data.report_type
      meta.value = res.meta ?? null
    } catch (err) {
      error.value = getApiErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function handleExport(params: Record<string, unknown>) {
    exportLoading.value = true
    try {
      await exportFn(params)
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      exportLoading.value = false
    }
  }

  return {
    items,
    summary,
    reportType,
    meta,
    loading,
    exportLoading,
    error,
    loadReport,
    handleExport,
  }
}
