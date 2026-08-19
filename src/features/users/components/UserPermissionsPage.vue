<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ShieldCheck, Search, Pencil } from '@lucide/vue'
import { AppCard, BaseInput, BaseButton, EmptyState } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useUserPermissions } from '../composables/useUserPermissions'
import EditPermissionDescriptionDialog from './EditPermissionDescriptionDialog.vue'
import type { Permission } from '../types/user'

const route = useRoute()
const router = useRouter()
const { can } = usePermission()

const userId = computed(() => Number(route.params.id))

const {
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
} = useUserPermissions()

const search = ref('')
const moduleFilter = ref('')

const moduleOptions = computed(() => {
  const modules = new Set(allPermissions.value.map((p) => p.module))
  return Array.from(modules).sort()
})

const filteredPermissions = computed(() => {
  const q = search.value.trim().toLowerCase()
  return allPermissions.value.filter((p) => {
    const matchesModule = !moduleFilter.value || p.module === moduleFilter.value
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
    return matchesModule && matchesSearch
  })
})

function resetFilters() {
  search.value = ''
  moduleFilter.value = ''
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

function statusOf(name: string): 'inherited' | 'direct' | 'none' {
  if (rolePermissions.value.includes(name)) return 'inherited'
  if (selectedPermissions.value.includes(name)) return 'direct'
  return 'none'
}

const editDialogOpen = ref(false)
const editingPermission = ref<Permission | null>(null)

function openEditDescription(perm: Permission) {
  editingPermission.value = perm
  editDialogOpen.value = true
}

function handleDescriptionUpdated(updated: Permission) {
  const current = allPermissions.value.find((p) => p.id === updated.id)
  if (current) current.description = updated.description
}

onMounted(() => load(userId.value))

async function handleSave() {
  await save(userId.value)
}

function handleCancel() {
  router.back()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back + header -->
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-lg hover:bg-gray-100 text-slate-500 hover:text-slate-700 transition-colors"
        @click="router.back()"
      >
        <ArrowLeft class="w-4 h-4" />
      </button>
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
          <ShieldCheck class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Assign Permissions</h1>
          <p v-if="user" class="text-sm text-slate-500">
            {{ user.name }} · {{ user.email }}
          </p>
          <p v-else class="text-sm text-slate-500">Manage direct permissions for this user.</p>
        </div>
      </div>
    </div>

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <BaseInput
          v-model="search"
          placeholder="Search permission name or description..."
          clearable
          class="w-full max-w-sm"
        >
          <template #prefix>
            <Search class="w-4 h-4 text-slate-400" />
          </template>
        </BaseInput>

        <el-select v-model="moduleFilter" placeholder="All Modules" clearable class="w-48">
          <el-option v-for="m in moduleOptions" :key="m" :label="capitalise(m)" :value="m" />
        </el-select>

        <button
          v-if="search || moduleFilter"
          class="text-sm text-slate-500 hover:text-slate-700"
          @click="resetFilters"
        >
          Reset
        </button>

        <span class="ml-auto text-xs text-slate-400">
          {{ selectedPermissions.filter((p) => !rolePermissions.includes(p)).length }} direct assigned
        </span>
      </div>

      <div v-if="loading" class="p-6">
        <el-skeleton :rows="6" animated />
      </div>

      <el-table v-else :data="filteredPermissions" class="w-full" row-class-name="cursor-default" height="700">
        <el-table-column label="Assign" width="80" align="center">
          <template #default="{ row }">
            <input
              type="checkbox"
              class="accent-emerald-600 w-4 h-4"
              :checked="selectedPermissions.includes(row.name)"
              :disabled="rolePermissions.includes(row.name)"
              @change="toggle(row.name)"
            />
          </template>
        </el-table-column>

        <el-table-column label="Permission" width="300">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-800">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Module" width="200">
          <template #default="{ row }">
            <el-tag size="small" type="primary" effect="plain" disable-transitions>
              {{ capitalise(row.module) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Description" min-width="280">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500 line-clamp-1 flex-1">
                {{ row.description ?? '—' }}
              </span>
              <el-tooltip v-if="can('roles_permissions.manage')" content="Edit description" placement="top">
                <button
                  class="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                  @click="openEditDescription(row)"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="110">
          <template #default="{ row }">
            <el-tag
              v-if="statusOf(row.name) === 'inherited'"
              size="small"
              type="info"
              effect="plain"
              disable-transitions
            >
              Inherited
            </el-tag>
            <el-tag
              v-else-if="statusOf(row.name) === 'direct'"
              size="small"
              type="success"
              effect="plain"
              disable-transitions
            >
              Direct
            </el-tag>
            <span v-else class="text-sm text-slate-300">—</span>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No permissions found"
            description="Try adjusting your search or module filter."
          />
        </template>
      </el-table>

      <template #footer>
        <div class="flex items-center justify-between">
          <p v-if="isDirty" class="text-xs text-amber-600">You have unsaved changes.</p>
          <p v-else class="text-xs text-slate-400">No changes to save.</p>
          <div class="flex justify-end gap-2">
            <BaseButton :disabled="submitting" @click="handleCancel">Cancel</BaseButton>
            <BaseButton
              type="primary"
              :loading="submitting"
              :disabled="!isDirty"
              @click="handleSave"
            >
              Save Permissions
            </BaseButton>
          </div>
        </div>
      </template>
    </AppCard>

    <EditPermissionDescriptionDialog
      v-model:visible="editDialogOpen"
      :permission="editingPermission"
      @updated="handleDescriptionUpdated"
    />
  </div>
</template>
