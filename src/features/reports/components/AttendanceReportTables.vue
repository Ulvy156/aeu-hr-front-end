<script setup lang="ts">
import { EmptyState, StatusBadge } from '@/components/common'
import { REPORT_TABLE_HEADER_STYLE } from '../constants/reports'
import type { AttendanceMonthlySummaryItem, AttendanceReportItem } from '../types/report'
import {
  formatReportDate,
  formatReportTime,
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
    v-if="reportType === 'monthly_summary'"
    :data="items as AttendanceMonthlySummaryItem[]"
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
    <el-table-column label="Present" width="90" align="center">
      <template #default="{ row }">
        <span class="text-xs font-medium text-emerald-600">{{ row.present_count ?? '—' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Late" width="80" align="center">
      <template #default="{ row }">
        <span class="text-xs font-medium text-amber-500">{{ row.late_count ?? '—' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Absent" width="80" align="center">
      <template #default="{ row }">
        <span class="text-xs font-medium text-red-600">{{ row.absent_count ?? '—' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Missing C/O" width="110" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-500">{{ row.missing_clock_out_count ?? '—' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Records" width="100" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.total_records ?? '—' }}</span>
      </template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No monthly summary found."
        description="Adjust filters and run the report."
      />
    </template>
  </el-table>

  <el-table
    v-else-if="reportType === 'correction_list'"
    :data="items as AttendanceReportItem[]"
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
    <el-table-column label="Date" width="130">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportDate(row.attendance_date) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Status" width="140">
      <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
    </el-table-column>
    <el-table-column label="Clock In" width="110">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportTime(row.clock_in_time) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Clock Out" width="110">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportTime(row.clock_out_time) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Corrected At" width="140">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{
          row.corrected_at ? formatReportDate(row.corrected_at) : '—'
        }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Reason" min-width="180">
      <template #default="{ row }">
        <span class="block max-w-xs truncate text-xs text-slate-600">{{
          row.correction_reason ?? '—'
        }}</span>
      </template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No correction records found."
        description="Adjust filters and run the report."
      />
    </template>
  </el-table>

  <el-table
    v-else
    :data="items as AttendanceReportItem[]"
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
    <el-table-column label="Date" width="130">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportDate(row.attendance_date) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Status" width="140">
      <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
    </el-table-column>
    <el-table-column label="Clock In" width="110">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportTime(row.clock_in_time) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Clock Out" width="110">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportTime(row.clock_out_time) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Late" width="70" align="center">
      <template #default="{ row }">
        <span v-if="row.is_late" class="text-xs font-medium text-amber-600">Yes</span>
        <span v-else class="text-xs text-slate-300">—</span>
      </template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No attendance records found."
        description="Adjust filters and run the report."
      />
    </template>
  </el-table>
</template>
