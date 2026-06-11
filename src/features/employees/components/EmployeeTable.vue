<script setup lang="ts">
import { MoreHorizontal } from '@lucide/vue'
import type { Employee } from '../types/employee'
import { EmptyState, BasePagination } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'

defineProps<{
  employees: Employee[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [emp: Employee]
  edit: [emp: Employee]
  delete: [emp: Employee]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()

function empStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'active') return 'success'
  if (status === 'resigned') return 'warning'
  if (status === 'terminated') return 'danger'
  return 'info'
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(val: string | null): string {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div>
    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-b-xl"
      >
        <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <el-table :data="employees" class="w-full">
        <!-- Name + Employee ID (combined) -->
        <el-table-column label="Employee" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-2.5">
              <img
                v-if="row.profile_photo_url"
                :src="row.profile_photo_url"
                class="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div
                v-else
                class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"
              >
                <span class="text-sm font-semibold text-emerald-700">
                  {{ row.full_name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-900 truncate">{{ row.full_name }}</p>
                <p class="text-xs text-slate-500 font-mono">{{ row.employee_id }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Email" min-width="180">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.user?.email ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Phone" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.phone_number ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Department" min-width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.department?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Position" min-width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.position?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="empStatusType(row.employment_status)" size="small" round>
              {{ capitalizeFirst(row.employment_status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Join Date" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDate(row.join_date) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <button
                class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-slate-700"
                @click.stop
              >
                <MoreHorizontal class="w-4 h-4" />
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="emit('view', row)">View Detail</el-dropdown-item>
                  <el-dropdown-item v-if="can('employees.update')" @click="emit('edit', row)">
                    Edit
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="can('employees.delete')"
                    style="color: #dc2626"
                    @click="emit('delete', row)"
                  >
                    Delete
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No employees found"
            description="Try adjusting your search or filters."
          />
        </template>
      </el-table>
    </div>

    <BasePagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @update:current-page="emit('page-change', $event)"
      @update:page-size="emit('size-change', $event)"
    />
  </div>
</template>
