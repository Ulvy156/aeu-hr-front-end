<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import { AppCard, StatusBadge } from '@/components/common'
import type { PendingLeaveSection } from '../types/dashboard'
import {
  dashboardTableHeaderStyle,
  formatDashboardDate,
  formatLeaveType,
} from '../utils/dashboardDisplay'

defineProps<{
  section: PendingLeaveSection
}>()
</script>

<template>
  <AppCard no-padding>
    <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <div class="flex items-center gap-2">
        <CalendarDays class="h-4 w-4 text-slate-400" />
        <h2 class="text-sm font-semibold text-slate-800">Pending leave requests</h2>
      </div>
      <span
        class="rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
      >
        {{ section.total }} pending
      </span>
    </div>

    <div v-if="section.items.length">
      <el-table :data="section.items" :header-cell-style="dashboardTableHeaderStyle" class="w-full">
        <el-table-column label="Employee" min-width="150">
          <template #default="{ row }">
            <p class="text-sm font-medium text-slate-800">{{ row.employee.full_name }}</p>
            <p class="text-xs text-slate-400">{{ row.employee.employee_id }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Type" width="110">
          <template #default="{ row }">
            <span class="text-sm text-slate-700">{{ formatLeaveType(row.leave_type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Period" min-width="180">
          <template #default="{ row }">
            <span class="text-sm text-slate-700">
              {{ formatDashboardDate(row.start_date) }} → {{ formatDashboardDate(row.end_date) }}
            </span>
            <span class="ml-1 text-xs text-slate-400">({{ row.total_days }}d)</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-10 text-center">
      <CalendarDays class="mb-3 h-10 w-10 text-slate-200" />
      <p class="text-sm text-slate-500">No pending leave requests.</p>
    </div>
  </AppCard>
</template>
