<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Eye, Send, CheckCircle, XCircle } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { PayrollBatch } from '../types/payroll'

defineProps<{
  payrolls: PayrollBatch[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  submit: [payroll: PayrollBatch]
  approve: [payroll: PayrollBatch]
  reject: [payroll: PayrollBatch]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const router = useRouter()
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

function viewDetail(payroll: PayrollBatch) {
  router.push({ name: 'payroll-detail', params: { id: payroll.id } })
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

      <el-table :data="payrolls" class="w-full" :header-cell-style="headerCellStyle">
        <el-table-column label="Period" min-width="140">
          <template #default="{ row }">
            <p class="text-sm font-semibold text-slate-800">{{ formatMonth(row.month) }} {{ row.year }}</p>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="140">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Employees" width="100" align="center">
          <template #default="{ row }">
            <span class="text-sm text-slate-700">{{ row.item_count }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Gross Salary" width="140" align="right">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-800">{{ formatMoney(row.totals?.gross_salary) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Net Salary" width="140" align="right">
          <template #default="{ row }">
            <span class="text-sm font-semibold text-emerald-700">{{ formatMoney(row.totals?.net_salary) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip content="View Detail" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-600"
                  @click="viewDetail(row)"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="can('payrolls.submit') && row.status === 'draft'" content="Submit for Approval" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-amber-50 transition-colors text-slate-400 hover:text-amber-600"
                  @click="emit('submit', row)"
                >
                  <Send class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="can('payrolls.approve') && row.status === 'pending_approval'" content="Approve" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-emerald-50 transition-colors text-slate-400 hover:text-emerald-600"
                  @click="emit('approve', row)"
                >
                  <CheckCircle class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="can('payrolls.reject') && row.status === 'pending_approval'" content="Reject" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600"
                  @click="emit('reject', row)"
                >
                  <XCircle class="w-4 h-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No payroll batches found."
            description="Try adjusting your filters or generate a new payroll batch."
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
