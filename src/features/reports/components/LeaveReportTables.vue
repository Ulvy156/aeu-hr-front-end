<script setup lang="ts">
import { EmptyState, StatusBadge } from '@/components/common'
import { REPORT_TABLE_HEADER_STYLE } from '../constants/reports'
import type { LeaveBalanceReportItem, LeaveReportItem } from '../types/report'
import {
  formatBalancePair,
  formatLeaveDuration,
  formatLeaveType,
  formatReportDate,
  reportEmployeeCode,
  reportEmployeeName,
} from '../utils/reportDisplay'
import ReportEmployeeCell from './ReportEmployeeCell.vue'

defineProps<{
  reportType: string
  items: unknown[]
}>()
</script>

<template>
  <el-table
    v-if="reportType === 'leave_balance'"
    :data="items as LeaveBalanceReportItem[]"
    :header-cell-style="REPORT_TABLE_HEADER_STYLE"
    class="w-full"
  >
    <el-table-column label="Employee" min-width="160">
      <template #default="{ row }">
        <ReportEmployeeCell
          :name="reportEmployeeName(row)"
          :employee-id="reportEmployeeCode(row)"
        />
      </template>
    </el-table-column>
    <el-table-column label="Year" align="center" width="90">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.year }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Annual Leave" align="center" min-width="120">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatBalancePair(row.annual) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Sick Leave" align="center" min-width="110">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatBalancePair(row.sick) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Special Leave" align="center" min-width="120">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatBalancePair(row.special) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Maternity Leave" align="center" min-width="130">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatBalancePair(row.maternity) }}</span>
      </template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No leave balance data found."
        description="Adjust filters and run the report."
      />
    </template>
  </el-table>

  <el-table
    v-else
    :data="items as LeaveReportItem[]"
    :header-cell-style="REPORT_TABLE_HEADER_STYLE"
    class="w-full"
  >
    <el-table-column label="Employee" min-width="160">
      <template #default="{ row }">
        <ReportEmployeeCell
          :name="reportEmployeeName(row)"
          :employee-id="reportEmployeeCode(row)"
        />
      </template>
    </el-table-column>
    <el-table-column label="Type" width="100">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatLeaveType(row.leave_type) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Duration" min-width="150">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{
          formatLeaveDuration(row.duration_type, row.half_day_period)
        }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Start" width="120">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportDate(row.start_date) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="End" width="120">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportDate(row.end_date) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Days" width="70" align="center">
      <template #default="{ row }">
        <span class="text-xs font-medium text-slate-800">{{ row.total_days }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Status" width="110">
      <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
    </el-table-column>
    <el-table-column label="HR" width="100">
      <template #default="{ row }">
        <StatusBadge :status="row.hr_approval_status ?? ''" />
      </template>
    </el-table-column>
    <el-table-column label="CEO" width="100">
      <template #default="{ row }">
        <StatusBadge :status="row.ceo_approval_status ?? ''" />
      </template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No leave records found."
        description="Adjust filters and run the report."
      />
    </template>
  </el-table>
</template>
