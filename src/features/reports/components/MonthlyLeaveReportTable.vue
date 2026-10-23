<script setup lang="ts">
import { computed } from 'vue'
import { EmptyState } from '@/components/common'
import { REPORT_TABLE_HEADER_STYLE } from '../constants/reports'
import type { MonthlyLeaveReportItem } from '../types/report'

const props = defineProps<{
  items: unknown[]
  leaveColumnLabel?: string
}>()

const leaveLabel = computed(() => props.leaveColumnLabel || 'Leave on month')
</script>

<template>
  <el-table
    :data="items as MonthlyLeaveReportItem[]"
    :header-cell-style="REPORT_TABLE_HEADER_STYLE"
    class="w-full"
  >
    <el-table-column label="No." width="60" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.no }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Name" min-width="150">
      <template #default="{ row }">
        <span class="text-xs font-medium text-slate-800">{{ row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Position" min-width="140">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.position }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Sex" width="70" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.gender }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Absence" width="90" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.absence_days }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="leaveLabel" width="110" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.leave_days }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Date / Reason" min-width="320">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.reason || '—' }}</span>
      </template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No employees found."
        description="Adjust the month and year, then run the report."
      />
    </template>
  </el-table>
</template>
