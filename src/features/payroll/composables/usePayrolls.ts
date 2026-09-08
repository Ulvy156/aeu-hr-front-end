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
import {
  EMPTY_PAYROLL_STATUS_COUNTS,
  PAYROLL_STATUS_VALUES,
  type PayrollBatch,
  type PaginationMeta,
  type PayrollStatusCounts,
  type RejectPayrollPayload,
  type GeneratePayrollPayload,
} from '../types/payroll'

export function usePayrolls() {
  const notify = useNotify()
  const payrolls = ref<PayrollBatch[]>([])
  const statusCounts = ref<PayrollStatusCounts>({ ...EMPTY_PAYROLL_STATUS_COUNTS })
  const currentCycle = ref<PayrollBatch | null>(null)
  const lastApproved = ref<PayrollBatch | null>(null)
  const latestRejected = ref<PayrollBatch | null>(null)
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

  function listParams(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    const params: Record<string, unknown> = {
      page: 1,
      per_page: 1,
      ...overrides,
    }
    if (filters.month) params.month = filters.month
    if (filters.year) params.year = filters.year
    if (filters.employee_id) params.employee_id = filters.employee_id
    return params
  }

  async function loadOverview() {
    const results = await Promise.all(
      PAYROLL_STATUS_VALUES.map((status) => fetchPayrolls(listParams({ status }))),
    )

    const byStatus = Object.fromEntries(
      PAYROLL_STATUS_VALUES.map((status, index) => [status, results[index]]),
    )

    const counts: PayrollStatusCounts = { ...EMPTY_PAYROLL_STATUS_COUNTS }
    for (const status of PAYROLL_STATUS_VALUES) {
      counts[status] = byStatus[status]?.meta.total ?? 0
    }
    counts.all = counts.draft + counts.pending_approval + counts.approved + counts.rejected
    statusCounts.value = counts

    currentCycle.value = byStatus.pending_approval?.data[0] ?? null
    lastApproved.value = byStatus.approved?.data[0] ?? null
    latestRejected.value = byStatus.rejected?.data[0] ?? null
  }

  async function loadList() {
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
  }

  async function loadPayrolls() {
    loading.value = true
    try {
      const [listResult, overviewResult] = await Promise.allSettled([loadList(), loadOverview()])
      const failed = [listResult, overviewResult].find((result) => result.status === 'rejected')
      if (failed && failed.status === 'rejected') {
        notify.error(getApiErrorMessage(failed.reason))
      }
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
    statusCounts,
    currentCycle,
    lastApproved,
    latestRejected,
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
