<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { getUserPermissions, syncUserPermissions, fetchPermissions } from '../services/user.api'
import type { UserListItem, Permission, UserPermissionsResponse } from '../types/user'
import { BaseModal, BaseButton } from '@/components/common'

const props = defineProps<{
  visible: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const notify = useNotify()
const loading = ref(false)
const submitting = ref(false)

const userPerms = ref<UserPermissionsResponse | null>(null)
const allPermissions = ref<Permission[]>([])
const selectedPermissions = ref<string[]>([])
const rolePermissions = ref<string[]>([])

// Group available permissions by module
const permissionGroups = computed(() => {
  const groups: Record<string, Permission[]> = {}
  for (const p of allPermissions.value) {
    const list = groups[p.module]
    if (list) list.push(p)
    else groups[p.module] = [p]
  }
  return groups
})

watch(
  () => props.visible,
  async (v) => {
    if (v && props.user) {
      await loadPermissions(props.user.id)
    }
  },
)

async function loadPermissions(userId: number) {
  loading.value = true
  userPerms.value = null
  selectedPermissions.value = []
  rolePermissions.value = []
  try {
    const [permsRes, allPermsRes] = await Promise.all([
      getUserPermissions(userId),
      fetchPermissions(),
    ])
    userPerms.value = permsRes.data
    allPermissions.value = allPermsRes.data
    rolePermissions.value = [...permsRes.data.role_permissions]
    selectedPermissions.value = [...permsRes.data.all_permissions]
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!props.user) return
  submitting.value = true
  try {
    const permissionsToSave = selectedPermissions.value.filter(
      (p) => !rolePermissions.value.includes(p),
    )
    await syncUserPermissions(props.user.id, { permissions: permissionsToSave })
    notify.success('Permissions updated successfully.')
    emit('update:visible', false)
    emit('saved')
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    submitting.value = false
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}
</script>

<template>
  <BaseModal
    :model-value="visible"
    title="Assign Permissions"
    width="640px"
    :loading="submitting"
    @update:model-value="emit('update:visible', $event)"
  >
    <!-- User info -->
    <div v-if="user" class="mb-5 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <span class="text-xs font-bold text-emerald-700">
          {{ user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') }}
        </span>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-800">{{ user.name }}</p>
        <p class="text-xs text-slate-400">{{ user.email }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <el-skeleton :rows="4" animated />
    </div>

    <template v-else-if="userPerms">
      <!-- Direct Permissions -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-sm font-semibold text-slate-800">Direct Permissions</p>
            <p class="text-xs text-slate-400 mt-0.5">Manually assigned to this user, independent of role.</p>
          </div>
          <span class="text-xs text-slate-400">
            {{ selectedPermissions.filter(p => !rolePermissions.includes(p)).length }} direct selected
          </span>
        </div>

        <div v-if="Object.keys(permissionGroups).length" class="space-y-4 max-h-72 overflow-y-auto pr-1">
          <div v-for="(perms, module) in permissionGroups" :key="module">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {{ capitalise(String(module)) }}
            </p>
            <div class="grid grid-cols-2 gap-1.5">
              <label
                v-for="perm in perms"
                :key="perm.name"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
                :class="rolePermissions.includes(perm.name)
                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  : selectedPermissions.includes(perm.name)
                    ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-pointer'
                    : 'bg-white border-gray-200 text-slate-600 cursor-pointer hover:border-gray-300'"
              >
                <input
                  type="checkbox"
                  :value="perm.name"
                  v-model="selectedPermissions"
                  :disabled="rolePermissions.includes(perm.name)"
                  class="accent-blue-600 shrink-0"
                />
                <span class="truncate flex-1">{{ perm.name }}</span>
                <el-tag
                  v-if="rolePermissions.includes(perm.name)"
                  size="small"
                  type="info"
                  effect="plain"
                  disable-transitions
                  class="shrink-0 !text-[9px] !px-1 !py-0"
                >
                  Inherited
                </el-tag>
              </label>
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-slate-400">No permissions available.</p>
      </div>

      <!-- Role Permissions -->
      <div class="pt-4 border-t border-gray-100">
        <p class="text-sm font-semibold text-slate-800 mb-1">Role Permissions</p>
        <p class="text-xs text-slate-400 mb-3">Inherited from assigned role(s). Cannot be removed here.</p>
        <div class="flex flex-wrap gap-1.5">
          <el-tag
            v-for="perm in userPerms.role_permissions"
            :key="perm"
            size="small"
            type="success"
            effect="plain"
            disable-transitions
          >
            {{ perm }}
          </el-tag>
          <span v-if="!userPerms.role_permissions.length" class="text-sm text-slate-400">None</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton @click="emit('update:visible', false)">Cancel</BaseButton>
        <BaseButton
          type="primary"
          :loading="submitting"
          :disabled="loading"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
          @click="handleSave"
        >
          Save Permissions
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
