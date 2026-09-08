import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  fetchUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  cancelUpgradeRequest,
} from '../services/employee-upgrade-request.api'
import {
  EMPTY_UPGRADE_REQUEST_STATUS_COUNTS,
  UPGRADE_REQUEST_STATUS_VALUES,
  type EmployeeUpgradeRequest,
  type EmployeeUpgradeRequestListParams,
  type PaginationMeta,
  type UpgradeRequestRejectPayload,
  type UpgradeRequestStatus,
  type UpgradeRequestStatusCounts,
} from '../types/employee-upgrade-request'

export function useUpgradeRequests() {
  const notify = useNotify()
  const requests = ref<EmployeeUpgradeRequest[]>([])
  const statusCounts = ref<UpgradeRequestStatusCounts>({ ...EMPTY_UPGRADE_REQUEST_STATUS_COUNTS })
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const actionLoading = ref(false)

  const filters = reactive({
    employee_id: null as number | null,
    status: '' as UpgradeRequestStatus | '',
    page: 1,
    per_page: 15,
  })

  function listParams(
    overrides: EmployeeUpgradeRequestListParams = {},
  ): EmployeeUpgradeRequestListParams {
    const params: EmployeeUpgradeRequestListParams = {
      page: 1,
      per_page: 1,
      ...overrides,
    }
    if (filters.employee_id) params.employee_id = filters.employee_id
    return params
  }

  async function loadOverview() {
    const results = await Promise.all(
      UPGRADE_REQUEST_STATUS_VALUES.map((status) => fetchUpgradeRequests(listParams({ status }))),
    )

    const counts: UpgradeRequestStatusCounts = { ...EMPTY_UPGRADE_REQUEST_STATUS_COUNTS }
    UPGRADE_REQUEST_STATUS_VALUES.forEach((status, index) => {
      counts[status] = results[index]?.meta.total ?? 0
    })
    counts.all = counts.pending + counts.approved + counts.rejected + counts.cancelled
    statusCounts.value = counts
  }

  async function loadList() {
    const params: EmployeeUpgradeRequestListParams = {
      page: filters.page,
      per_page: filters.per_page,
    }
    if (filters.employee_id) params.employee_id = filters.employee_id
    if (filters.status) params.status = filters.status

    const res = await fetchUpgradeRequests(params)
    requests.value = res.data
    meta.value = res.meta
  }

  async function loadRequests(includeOverview = true) {
    loading.value = true
    try {
      const tasks: Promise<void>[] = [loadList()]
      if (includeOverview) tasks.push(loadOverview())
      const results = await Promise.allSettled(tasks)
      const failed = results.find((result) => result.status === 'rejected')
      if (failed && failed.status === 'rejected') {
        notify.error(getApiErrorMessage(failed.reason))
      }
    } finally {
      loading.value = false
    }
  }

  function applyFilters(employeeId: number | null, status: string) {
    filters.employee_id = employeeId
    filters.status = status as UpgradeRequestStatus | ''
    filters.page = 1
    loadRequests()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadRequests(false)
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadRequests(false)
  }

  async function handleApprove(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await approveUpgradeRequest(id)
      notify.success(
        'Upgrade request approved. The employee record was updated and the change was recorded in their employment history.',
      )
      await loadRequests()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleReject(id: number, payload: UpgradeRequestRejectPayload): Promise<boolean> {
    actionLoading.value = true
    try {
      await rejectUpgradeRequest(id, payload)
      notify.success('Upgrade request rejected.')
      await loadRequests()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleCancel(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await cancelUpgradeRequest(id)
      notify.success('Upgrade request cancelled.')
      await loadRequests()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  return {
    requests,
    statusCounts,
    meta,
    loading,
    actionLoading,
    filters,
    loadRequests,
    applyFilters,
    onPageChange,
    onPageSizeChange,
    handleApprove,
    handleReject,
    handleCancel,
  }
}
