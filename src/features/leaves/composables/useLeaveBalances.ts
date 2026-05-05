import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchLeaveBalances } from '../services/leave.api'
import type { LeaveBalanceData } from '../types/leave'

export function useLeaveBalances() {
  const notify = useNotify()
  const balanceData = ref<LeaveBalanceData | null>(null)
  const loading = ref(false)

  async function loadBalances(params: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await fetchLeaveBalances(params)
      balanceData.value = res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  return {
    balanceData,
    loading,
    loadBalances,
  }
}
