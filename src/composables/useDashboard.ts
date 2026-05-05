import { ref } from 'vue'
import axios from 'axios'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

type ApiFetchFn<T> = () => Promise<{ success: boolean; message: string; data: T }>

export function useDashboard<T>(fetchFn: ApiFetchFn<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isForbidden = ref(false)

  async function load() {
    loading.value = true
    error.value = null
    isForbidden.value = false
    try {
      const res = await fetchFn()
      data.value = res.data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        isForbidden.value = true
      } else {
        error.value = getApiErrorMessage(err)
      }
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, isForbidden, load }
}
