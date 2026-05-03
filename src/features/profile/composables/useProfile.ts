import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { getProfile } from '../services/profile.api'
import type { ProfileUser } from '../types/profile'

export function useProfile() {
  const profile = ref<ProfileUser | null>(null)
  const loading = ref(false)
  const notify = useNotify()

  async function fetchProfile() {
    loading.value = true
    try {
      const res = await getProfile()
      profile.value = res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  return { profile, loading, fetchProfile }
}
