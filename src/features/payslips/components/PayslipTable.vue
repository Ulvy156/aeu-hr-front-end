<script setup lang="ts">
import { Eye, Download } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { Payslip } from '../types/payslip'

const props = defineProps<{
  payslips: Payslip[]
  loading: boolean
  downloadLoading: Record<number, boolean>
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [payslip: Payslip]
  download: [payslip: Payslip]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatMonth(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month)
}

function formatMoney(value: string | undefined): string {
  if (!value) return '—'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function canDownload(payslip: Payslip): boolean {
  return can('payslips.download_any') || can('payslips.download_own')
}

const headerCellStyle = {
  background: '#f9fafb',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
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

      <el-table :data="payslips" class="w-full" :header-cell-style="headerCellStyle">
        <el-table-column label="Employee" min-width="160">
          <template #default="{ row }">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ row.employee.full_name }}</p>
              <p class="text-xs text-slate-400">{{ row.employee.employee_id }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Period" width="150">
          <template #default="{ row }">
            <p class="text-sm text-slate-700">
              {{ formatMonth(row.payroll_batch.month) }} {{ row.payroll_batch.year }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Batch Status" width="140">
          <template #default="{ row }">
            <StatusBadge :status="row.payroll_batch.status" />
          </template>
        </el-table-column>

        <el-table-column label="Gross Salary" width="140" align="right">
          <template #default="{ row }">
            <span class="text-sm text-slate-700">{{ formatMoney(row.gross_salary) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Tax Amount" width="120" align="right">
          <template #default="{ row }">
            <span class="text-sm text-amber-600">{{ formatMoney(row.tax_amount) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Net Salary" width="130" align="right">
          <template #default="{ row }">
            <span class="text-sm font-semibold text-emerald-700">{{ formatMoney(row.net_salary) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip content="View Detail" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-600"
                  @click="emit('view', row)"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canDownload(row)" content="Download PDF" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-emerald-50 transition-colors text-slate-400 hover:text-emerald-600 disabled:opacity-40"
                  :disabled="downloadLoading[row.id]"
                  @click="emit('download', row)"
                >
                  <div
                    v-if="downloadLoading[row.id]"
                    class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"
                  />
                  <Download v-else class="w-4 h-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No payslips found."
            description="Try adjusting your filters. Only approved payslips are visible."
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
