<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Pencil } from '@lucide/vue'
import { PageHeader, AppCard, BaseInput, EmptyState } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { usePermissionCatalog } from '../composables/usePermissionCatalog'
import EditPermissionDescriptionDialog from '@/features/users/components/EditPermissionDescriptionDialog.vue'
import type { Permission } from '@/features/users/types/user'

const { can } = usePermission()
const { permissions, loading, load, applyUpdated } = usePermissionCatalog()

const search = ref('')
const moduleFilter = ref('')

const moduleOptions = computed(() => {
  const modules = new Set(permissions.value.map((p) => p.module))
  return Array.from(modules).sort()
})

const filteredPermissions = computed(() => {
  const q = search.value.trim().toLowerCase()
  return permissions.value.filter((p) => {
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

const editDialogOpen = ref(false)
const editingPermission = ref<Permission | null>(null)

function openEditDescription(perm: Permission) {
  editingPermission.value = perm
  editDialogOpen.value = true
}

onMounted(load)
</script>

<template>
  <div class="grid grid-cols-1 gap-y-5">
    <PageHeader
      title="Permissions"
      subtitle="Browse all system permissions and edit their descriptions."
    />

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
          {{ permissions.length }} permissions
        </span>
      </div>

      <div v-if="loading" class="p-6">
        <el-skeleton :rows="8" animated />
      </div>

      <el-table v-else :data="filteredPermissions" class="w-full" row-class-name="cursor-default">
        <el-table-column label="Permission" min-width="260">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-800">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Module" width="180">
          <template #default="{ row }">
            <el-tag size="small" type="primary" effect="plain" disable-transitions>
              {{ capitalise(row.module) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Description" min-width="320">
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

        <template #empty>
          <EmptyState
            title="No permissions found"
            description="Try adjusting your search or module filter."
          />
        </template>
      </el-table>
    </AppCard>

    <EditPermissionDescriptionDialog
      v-model:visible="editDialogOpen"
      :permission="editingPermission"
      @updated="applyUpdated"
    />
  </div>
</template>
