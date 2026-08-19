import { ref } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchUser, getUserPermissions, fetchPermissions } from '../services/user.api'
import type { UserDetail } from '../types/user'

export interface UserPermissionRow {
  name: string
  module: string
  description: string | null
  source: 'direct' | 'role'
}

export function useUserDetail() {
  const notify = useNotify()

  const user = ref<UserDetail | null>(null)
  const permissionRows = ref<UserPermissionRow[]>([])
  const loading = ref(false)

  async function load(userId: number) {
    loading.value = true
    try {
      const [userRes, permsRes, allPermsRes] = await Promise.all([
        fetchUser(userId),
        getUserPermissions(userId),
        fetchPermissions(),
      ])
      user.value = userRes.data

      const catalog = new Map(allPermsRes.data.map((p) => [p.name, p]))
      permissionRows.value = permsRes.data.all_permissions.map((name) => {
        const meta = catalog.get(name)
        return {
          name,
          module: meta?.module ?? name.split('.')[0] ?? '',
          description: meta?.description ?? null,
          source: permsRes.data.role_permissions.includes(name) ? 'role' : 'direct',
        }
      })
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    permissionRows,
    loading,
    load,
  }
}
