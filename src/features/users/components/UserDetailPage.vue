<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Shield, Link, Search } from '@lucide/vue'
import { AppCard, BaseInput, StatusBadge, EmptyState } from '@/components/common'
import { useUserDetail } from '../composables/useUserDetail'

const route = useRoute()
const router = useRouter()

const userId = computed(() => Number(route.params.id))

const { user, permissionRows, loading, load } = useUserDetail()

const search = ref('')
const moduleFilter = ref('')

const moduleOptions = computed(() => {
  const modules = new Set(permissionRows.value.map((p) => p.module))
  return Array.from(modules).sort()
})

const filteredPermissions = computed(() => {
  const q = search.value.trim().toLowerCase()
  return permissionRows.value.filter((p) => {
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

onMounted(() => load(userId.value))
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
          <User class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">User Detail</h1>
          <p v-if="user" class="text-sm text-slate-500">
            {{ user.name }} · {{ user.email }}
          </p>
          <p v-else class="text-sm text-slate-500">View user account, role, and permissions.</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="space-y-6">
      <AppCard>
        <el-skeleton :rows="3" animated />
      </AppCard>
      <AppCard no-padding>
        <div class="p-6">
          <el-skeleton :rows="6" animated />
        </div>
      </AppCard>
    </div>

    <template v-else-if="user">
      <!-- User summary -->
      <AppCard>
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <span class="text-sm font-bold text-emerald-700">
                {{ user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') }}
              </span>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ user.name }}</p>
              <p class="text-xs text-slate-500">{{ user.email }}</p>
              <div class="mt-1.5">
                <StatusBadge :status="user.status" />
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-2">
              <Shield class="w-4 h-4 text-slate-400" />
              <span class="text-sm font-semibold text-slate-700">Roles</span>
            </div>
            <div class="flex flex-wrap gap-1.5 max-w-xs">
              <el-tag v-for="role in user.roles" :key="role" type="primary" effect="plain" size="small">
                {{ role }}
              </el-tag>
              <span v-if="!user.roles.length" class="text-sm text-slate-400">No roles assigned</span>
            </div>
          </div>

          <div v-if="user.employee">
            <div class="flex items-center gap-2 mb-2">
              <Link class="w-4 h-4 text-slate-400" />
              <span class="text-sm font-semibold text-slate-700">Linked Employee</span>
            </div>
            <div class="text-sm space-y-1">
              <p class="text-slate-800 font-medium">{{ user.employee.full_name }}</p>
              <p class="text-slate-500">{{ user.employee.employee_id }}</p>
              <p v-if="user.employee.department || user.employee.position" class="text-slate-500">
                {{ user.employee.position?.name }}<template v-if="user.employee.position && user.employee.department"> · </template>{{ user.employee.department?.name }}
              </p>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Effective permissions -->
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
            {{ permissionRows.length }} effective permissions
          </span>
        </div>

        <el-table :data="filteredPermissions" class="w-full" row-class-name="cursor-default" height="600">
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
              <span class="text-sm text-slate-500 line-clamp-1">
                {{ row.description ?? '—' }}
              </span>
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
    </template>
  </div>
</template>
