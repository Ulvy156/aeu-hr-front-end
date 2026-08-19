import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchPermissions } from '@/features/users/services/user.api'
import type { Permission } from '@/features/users/types/user'

export function usePermissionCatalog() {
  const notify = useNotify()

  const permissions = ref<Permission[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const res = await fetchPermissions()
      permissions.value = res.data
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function applyUpdated(updated: Permission) {
    const current = permissions.value.find((p) => p.id === updated.id)
    if (current) current.description = updated.description
  }

  return {
    permissions,
    loading,
    load,
    applyUpdated,
  }
}
