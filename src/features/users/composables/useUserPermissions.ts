import { ref, computed } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fetchUser, getUserPermissions, syncUserPermissions, fetchPermissions } from '../services/user.api'
import type { UserDetail, Permission } from '../types/user'

export function useUserPermissions() {
  const notify = useNotify()

  const user = ref<UserDetail | null>(null)
  const allPermissions = ref<Permission[]>([])
  const selectedPermissions = ref<string[]>([])
  const rolePermissions = ref<string[]>([])

  const loading = ref(false)
  const submitting = ref(false)

  const isDirty = computed(() => {
    const direct = selectedPermissions.value.filter((p) => !rolePermissions.value.includes(p)).sort()
    const original = (user.value?.permissions ?? [])
      .filter((p) => !rolePermissions.value.includes(p))
      .sort()
    return JSON.stringify(direct) !== JSON.stringify(original)
  })

  async function load(userId: number) {
    loading.value = true
    try {
      const [userRes, permsRes, allPermsRes] = await Promise.all([
        fetchUser(userId),
        getUserPermissions(userId),
        fetchPermissions(),
      ])
      user.value = userRes.data
      allPermissions.value = allPermsRes.data
      rolePermissions.value = [...permsRes.data.role_permissions]
      selectedPermissions.value = [...permsRes.data.all_permissions]
    } catch (err) {
      notify.error(getApiErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  function toggle(permissionName: string) {
    if (rolePermissions.value.includes(permissionName)) return
    const idx = selectedPermissions.value.indexOf(permissionName)
    if (idx === -1) selectedPermissions.value.push(permissionName)
    else selectedPermissions.value.splice(idx, 1)
  }

  async function save(userId: number): Promise<boolean> {
    submitting.value = true
    try {
      const permissionsToSave = selectedPermissions.value.filter(
        (p) => !rolePermissions.value.includes(p),
      )
      const res = await syncUserPermissions(userId, { permissions: permissionsToSave })
      rolePermissions.value = [...res.data.role_permissions]
      selectedPermissions.value = [...res.data.all_permissions]
      if (user.value) user.value.permissions = [...res.data.all_permissions]
      notify.success('Permissions updated successfully.')
      return true
    } catch (err) {
      notify.error(getApiErrorMessage(err))
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    user,
    allPermissions,
    selectedPermissions,
    rolePermissions,
    loading,
    submitting,
    isDirty,
    load,
    toggle,
    save,
  }
}
