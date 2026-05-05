import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchPayslips, fetchPayslip, downloadPayslip } from '../services/payslip.api'
import type { Payslip, PaginationMeta } from '../types/payslip'

export function usePayslips() {
  const notify = useNotify()
  const payslips = ref<Payslip[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const selectedPayslip = ref<Payslip | null>(null)
  const detailLoading = ref(false)
  const downloadLoading = ref<Record<number, boolean>>({})

  const filters = reactive({
    month: '',
    year: '',
    employee_id: '',
    page: 1,
    per_page: 15,
  })

  async function loadPayslips() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.month) params.month = filters.month
      if (filters.year) params.year = filters.year
      if (filters.employee_id) params.employee_id = filters.employee_id

      const res = await fetchPayslips(params)
      payslips.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(month: string, year: string, employeeId: string) {
    filters.month = month
    filters.year = year
    filters.employee_id = employeeId
    filters.page = 1
    loadPayslips()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadPayslips()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadPayslips()
  }

  async function loadPayslipDetail(id: number) {
    detailLoading.value = true
    try {
      const res = await fetchPayslip(id)
      selectedPayslip.value = res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      detailLoading.value = false
    }
  }

  async function handleDownload(id: number) {
    downloadLoading.value[id] = true
    try {
      await downloadPayslip(id)
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      downloadLoading.value[id] = false
    }
  }

  return {
    payslips,
    meta,
    loading,
    selectedPayslip,
    detailLoading,
    downloadLoading,
    filters,
    loadPayslips,
    applyFilters,
    onPageChange,
    onPageSizeChange,
    loadPayslipDetail,
    handleDownload,
  }
}
