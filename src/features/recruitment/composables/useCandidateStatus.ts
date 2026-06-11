import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { updateCandidateStatus } from '../services/candidate.api'
import type { Candidate, CandidateStatusPayload } from '../types/candidate'

export function useCandidateStatus() {
  const notify = useNotify()
  const actionLoading = ref(false)

  async function changeStatus(id: number, payload: CandidateStatusPayload): Promise<Candidate | null> {
    actionLoading.value = true
    try {
      const res = await updateCandidateStatus(id, payload)
      notify.success('Candidate status updated successfully.')
      return res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return null
    } finally {
      actionLoading.value = false
    }
  }

  return {
    actionLoading,
    changeStatus,
  }
}
