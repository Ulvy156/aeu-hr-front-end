import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  fetchUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  cancelUpgradeRequest,
} from '../services/employee-upgrade-request.api'
import type {
  EmployeeUpgradeRequest,
  EmployeeUpgradeRequestListParams,
  PaginationMeta,
  UpgradeRequestRejectPayload,
} from '../types/employee-upgrade-request'

export function useUpgradeRequests() {
  const notify = useNotify()
  const requests = ref<EmployeeUpgradeRequest[]>([])
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
    status: '' as EmployeeUpgradeRequestListParams['status'] | '',
    page: 1,
    per_page: 15,
  })

  async function loadRequests() {
    loading.value = true
    try {
      const params: EmployeeUpgradeRequestListParams = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.employee_id) params.employee_id = filters.employee_id
      if (filters.status) params.status = filters.status

      const res = await fetchUpgradeRequests(params)
      requests.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(next: { employee_id: number | null; status: string }) {
    filters.employee_id = next.employee_id
    filters.status = next.status as EmployeeUpgradeRequestListParams['status'] | ''
    filters.page = 1
    loadRequests()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadRequests()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadRequests()
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
