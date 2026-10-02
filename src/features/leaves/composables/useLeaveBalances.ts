import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchLeaveBalances } from '../services/leave.api'
import type { LeaveBalanceData } from '../types/leave'

export function useLeaveBalances() {
  const notify = useNotify()
  const balanceData = ref<LeaveBalanceData | null>(null)
  const loading = ref(false)
  let requestId = 0

  async function loadBalances(params: Record<string, unknown> = {}) {
    const currentRequest = ++requestId
    loading.value = true
    balanceData.value = null
    try {
      const res = await fetchLeaveBalances(params)
      if (currentRequest === requestId) balanceData.value = res.data
    } catch (err) {
      if (currentRequest === requestId) notify.error(getApiErrorMessage(err))
    } finally {
      if (currentRequest === requestId) loading.value = false
    }
  }

  function clearBalances() {
    requestId++
    balanceData.value = null
    loading.value = false
  }

  return {
    balanceData,
    loading,
    loadBalances,
    clearBalances,
  }
}
