import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  fetchPayrolls,
  generatePayroll,
  submitPayroll,
  approvePayroll,
  rejectPayroll,
} from '../services/payroll.api'
import type { PayrollBatch, PaginationMeta, RejectPayrollPayload, GeneratePayrollPayload } from '../types/payroll'

export function usePayrolls() {
  const notify = useNotify()
  const payrolls = ref<PayrollBatch[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const actionLoading = ref(false)

  const filters = reactive({
    month: '',
    year: '',
    status: '',
    employee_id: '',
    page: 1,
    per_page: 15,
  })

  async function loadPayrolls() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.month) params.month = filters.month
      if (filters.year) params.year = filters.year
      if (filters.status) params.status = filters.status
      if (filters.employee_id) params.employee_id = filters.employee_id

      const res = await fetchPayrolls(params)
      payrolls.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(month: string, year: string, status: string) {
    filters.month = month
    filters.year = year
    filters.status = status
    filters.page = 1
    loadPayrolls()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadPayrolls()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadPayrolls()
  }

  async function handleGenerate(payload: GeneratePayrollPayload): Promise<boolean> {
    actionLoading.value = true
    try {
      await generatePayroll(payload)
      notify.success('Payroll generated successfully.')
      await loadPayrolls()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleSubmit(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await submitPayroll(id)
      notify.success('Payroll submitted for approval.')
      await loadPayrolls()
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
      await approvePayroll(id)
      notify.success('Payroll approved successfully.')
      await loadPayrolls()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleReject(id: number, payload: RejectPayrollPayload): Promise<boolean> {
    actionLoading.value = true
    try {
      await rejectPayroll(id, payload)
      notify.success('Payroll rejected.')
      await loadPayrolls()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  return {
    payrolls,
    meta,
    loading,
    actionLoading,
    filters,
    loadPayrolls,
    applyFilters,
    onPageChange,
    onPageSizeChange,
    handleGenerate,
    handleSubmit,
    handleApprove,
    handleReject,
  }
}
