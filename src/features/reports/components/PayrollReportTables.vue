<script setup lang="ts">
import { EmptyState, StatusBadge } from '@/components/common'
import { REPORT_TABLE_HEADER_STYLE } from '../constants/reports'
import type {
  PayrollEmployeeListItem,
  PayrollMonthlySummaryItem,
  PayrollStatusSummaryItem,
} from '../types/report'
import {
  formatReportMoney,
  formatReportMonth,
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
    v-if="reportType === 'employee_list'"
    :data="items as PayrollEmployeeListItem[]"
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
    <el-table-column label="Period" width="120">
      <template #default="{ row }">
        <span class="text-xs text-slate-700"
          >{{ formatReportMonth(row.payroll_batch?.month) }} {{ row.payroll_batch?.year }}</span
        >
      </template>
    </el-table-column>
    <el-table-column label="Batch Status" width="130">
      <template #default="{ row }">
        <StatusBadge :status="row.payroll_batch?.status ?? ''" />
      </template>
    </el-table-column>
    <el-table-column label="Gross" width="120" align="right">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportMoney(row.gross_salary) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="NSSF" width="110" align="right">
      <template #default="{ row }">
        <span class="text-xs text-amber-600">{{ formatReportMoney(row.nssf_deduction) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Net Salary" width="120" align="right">
      <template #default="{ row }">
        <span class="text-xs font-semibold text-emerald-700">{{
          formatReportMoney(row.net_salary)
        }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Item Status" width="110">
      <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No payroll records found."
        description="Adjust filters and run the report."
      />
    </template>
  </el-table>

  <el-table
    v-else-if="reportType === 'monthly_summary'"
    :data="items as PayrollMonthlySummaryItem[]"
    :header-cell-style="REPORT_TABLE_HEADER_STYLE"
    class="w-full"
  >
    <el-table-column label="Period" width="130">
      <template #default="{ row }">
        <span class="text-xs font-medium text-slate-800"
          >{{ formatReportMonth(row.month) }} {{ row.year }}</span
        >
      </template>
    </el-table-column>
    <el-table-column label="Status" width="140">
      <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
    </el-table-column>
    <el-table-column label="Employees" width="100" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.item_count }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Gross" width="130" align="right">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ formatReportMoney(row.totals?.gross_salary) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="NSSF" width="120" align="right">
      <template #default="{ row }">
        <span class="text-xs text-amber-600">{{
          formatReportMoney(row.totals?.nssf_deduction)
        }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Net Salary" width="130" align="right">
      <template #default="{ row }">
        <span class="text-xs font-semibold text-emerald-700">{{
          formatReportMoney(row.totals?.net_salary)
        }}</span>
      </template>
    </el-table-column>
    <template #empty>
      <EmptyState
        title="No payroll batches found."
        description="Adjust filters and run the report."
      />
    </template>
  </el-table>

  <el-table
    v-else-if="reportType === 'status_summary'"
    :data="items as PayrollStatusSummaryItem[]"
    :header-cell-style="REPORT_TABLE_HEADER_STYLE"
    class="w-full"
  >
    <el-table-column label="Status" width="160">
      <template #default="{ row }">
        <StatusBadge :status="String(row.status ?? '')" />
      </template>
    </el-table-column>
    <el-table-column label="Batches" width="100" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.batch_count ?? '—' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Employees" width="100" align="center">
      <template #default="{ row }">
        <span class="text-xs text-slate-700">{{ row.item_count ?? '—' }}</span>
      </template>
    </el-table-column>
    <template
      v-for="key in Object.keys(items[0] ?? {}).filter(
        (k) => !['status', 'batch_count', 'item_count'].includes(k),
      )"
      :key="key"
    >
      <el-table-column :label="key.replace(/_/g, ' ')" min-width="130" align="right">
        <template #default="{ row }">
          <span class="text-xs text-slate-700">{{
            (row as Record<string, unknown>)[key]
          }}</span>
        </template>
      </el-table-column>
    </template>
    <template #empty>
      <EmptyState
        title="No status summary data found."
        description="Run the report to see results."
      />
    </template>
  </el-table>
</template>
