import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchVacancy, closeVacancy } from '../services/vacancy.api'
import type { Vacancy } from '../types/vacancy'

export function useVacancyDetail() {
  const notify = useNotify()
  const vacancy = ref<Vacancy | null>(null)
  const loading = ref(false)
  const actionLoading = ref(false)

  async function loadVacancy(id: number) {
    loading.value = true
    try {
      const res = await fetchVacancy(id)
      vacancy.value = res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  async function handleClose(id: number): Promise<boolean> {
    actionLoading.value = true
    try {
      const res = await closeVacancy(id)
      vacancy.value = res.data
      notify.success('Vacancy closed successfully.')
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      actionLoading.value = false
    }
  }

  return {
    vacancy,
    loading,
    actionLoading,
    loadVacancy,
    handleClose,
  }
}
