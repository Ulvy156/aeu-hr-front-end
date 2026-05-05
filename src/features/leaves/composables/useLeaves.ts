import { ref, reactive } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchLeaves, approveLeave, rejectLeave, cancelLeave } from '../services/leave.api'
import type { Leave, PaginationMeta, LeaveRejectPayload } from '../types/leave'

export function useLeaves() {
  const notify = useNotify()
  const leaves = ref<Leave[]>([])
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const actionLoading = ref(false)

  const filters = reactive({
    status: '',
    leave_type: '',
    date_from: '',
    date_to: '',
    employee_id: '',
    page: 1,
    per_page: 15,
  })

  async function loadLeaves() {
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        per_page: filters.per_page,
      }
      if (filters.status) params.status = filters.status
      if (filters.leave_type) params.leave_type = filters.leave_type
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.employee_id) params.employee_id = filters.employee_id

      const res = await fetchLeaves(params)
      leaves.value = res.data
      meta.value = res.meta
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyFilters(
    status: string,
    leaveType: string,
    dateFrom: string,
    dateTo: string,
    employeeId: string,
  ) {
    filters.status = status
    filters.leave_type = leaveType
    filters.date_from = dateFrom
    filters.date_to = dateTo
    filters.employee_id = employeeId
    filters.page = 1
    loadLeaves()
  }

  function onPageChange(page: number) {
    filters.page = page
    loadLeaves()
  }

  function onPageSizeChange(size: number) {
    filters.per_page = size
    filters.page = 1
    loadLeaves()
  }

  async function handleApprove(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      await approveLeave(id)
      notify.success('Leave approved successfully.')
      await loadLeaves()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function handleReject(id: number, payload: LeaveRejectPayload): Promise<boolean> {
    actionLoading.value = true
    try {
      await rejectLeave(id, payload)
      notify.success('Leave rejected.')
      await loadLeaves()
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
      await cancelLeave(id)
      notify.success('Leave cancelled.')
      await loadLeaves()
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  return {
    leaves,
    meta,
    loading,
    actionLoading,
    filters,
    loadLeaves,
    applyFilters,
    onPageChange,
    onPageSizeChange,
    handleApprove,
    handleReject,
    handleCancel,
  }
}
