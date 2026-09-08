<script setup lang="ts">
import { MoreHorizontal } from '@lucide/vue'
import { EMPLOYMENT_STATUS_LABELS } from '../types/employee'
import type { Employee } from '../types/employee'
import { formatPositionLabel } from '@/features/positions/types/job-level'
import { EmptyState, BasePagination, StatusBadge } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import {
  employeeTenureLabel,
  employmentStatusHint,
  formatEmployeeDate,
} from '../utils/employeeDisplay'

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
  'request-upgrade': [emp: Employee]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()
</script>

<template>
  <div>
    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-white/70"
      >
        <div
          class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
        />
      </div>

      <el-table :data="employees" class="w-full" @row-click="(row: Employee) => emit('view', row)">
        <el-table-column label="Employee" min-width="240">
          <template #default="{ row }">
            <div class="flex items-center gap-2.5">
              <img
                v-if="row.profile_photo_url"
                :src="row.profile_photo_url"
                class="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div
                v-else
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100"
              >
                <span class="text-sm font-semibold text-emerald-700">
                  {{ row.full_name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0">
                <p
                  class="cursor-pointer truncate text-sm font-medium text-slate-900 hover:text-emerald-600"
                >
                  {{ row.full_name }}
                </p>
                <p class="truncate text-xs text-slate-500">
                  {{ row.user?.email ? `${row.employee_id} · ${row.user.email}` : row.employee_id }}
                </p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Role" min-width="180">
          <template #default="{ row }">
            <p class="truncate text-sm font-medium text-slate-800">
              {{
                row.position ? formatPositionLabel(row.position.name, row.position.job_level) : '—'
              }}
            </p>
            <p class="text-xs text-slate-500">{{ row.department?.name ?? '—' }}</p>
          </template>
        </el-table-column>

        <el-table-column label="Manager" min-width="140">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.manager?.full_name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="140">
          <template #default="{ row }: { row: Employee }">
            <StatusBadge
              :status="row.employment_status"
              :custom-label="EMPLOYMENT_STATUS_LABELS[row.employment_status]"
            />
            <p v-if="employmentStatusHint(row)" class="mt-0.5 text-xs text-slate-400">
              {{ employmentStatusHint(row) }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Joined" width="130">
          <template #default="{ row }">
            <p class="text-sm text-slate-600">{{ formatEmployeeDate(row.join_date) }}</p>
            <p class="text-xs text-slate-400">{{ employeeTenureLabel(row.join_date) }}</p>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <div @click.stop>
              <el-dropdown trigger="click">
                <button
                  class="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-700"
                  @click.stop
                >
                  <MoreHorizontal class="h-4 w-4" />
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="emit('view', row)">View Detail</el-dropdown-item>
                    <el-dropdown-item v-if="can('employees.update')" @click="emit('edit', row)">
                      Edit
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="can('employee_upgrade_requests.create')"
                      @click="emit('request-upgrade', row)"
                    >
                      Request Promote
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
            </div>
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
