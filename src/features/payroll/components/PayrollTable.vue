<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Eye, Send, CheckCircle, XCircle } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { PayrollBatch } from '../types/payroll'
import {
  displayedDeductionTotal,
  formatPayrollMoney,
  formatPayrollPeriod,
  payrollStatusLabel,
  payrollTimeline,
} from '../utils/payrollDisplay'

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

function viewDetail(payroll: PayrollBatch) {
  router.push({ name: 'payroll-detail', params: { id: payroll.id } })
}
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

      <el-table :data="payrolls" class="w-full" @row-click="(row: PayrollBatch) => viewDetail(row)">
        <el-table-column label="Period" min-width="200">
          <template #default="{ row }">
            <p class="cursor-pointer text-sm font-semibold text-slate-800 hover:text-emerald-600">
              {{ formatPayrollPeriod(row.month, row.year) }}
            </p>
            <p v-if="payrollTimeline(row)" class="text-xs text-slate-500">
              {{ payrollTimeline(row) }}
            </p>
            <p
              v-if="row.status === 'rejected' && row.rejection_reason"
              class="mt-0.5 line-clamp-2 text-xs text-slate-500"
            >
              {{ row.rejection_reason }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <StatusBadge :status="row.status" :custom-label="payrollStatusLabel(row.status)" />
          </template>
        </el-table-column>

        <el-table-column label="Employees" width="110" align="center">
          <template #default="{ row }">
            <span class="text-sm text-slate-700">{{ row.item_count }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Deductions" width="150" align="right">
          <template #default="{ row }">
            <p class="text-sm text-slate-800">{{ displayedDeductionTotal(row.totals) }}</p>
            <p class="text-xs text-slate-400">
              Tax {{ formatPayrollMoney(row.totals?.tax_amount) }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Net" width="160" align="right">
          <template #default="{ row }">
            <p class="text-sm font-semibold text-emerald-700">
              {{ formatPayrollMoney(row.totals?.net_salary) }}
            </p>
            <p class="text-xs text-slate-400">
              Gross {{ formatPayrollMoney(row.totals?.gross_salary) }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1" @click.stop>
              <el-tooltip content="View Detail" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  @click="viewDetail(row)"
                >
                  <Eye class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="can('payrolls.submit') && row.status === 'draft'"
                content="Submit for Approval"
                placement="top"
              >
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                  @click="emit('submit', row)"
                >
                  <Send class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="can('payrolls.approve') && row.status === 'pending_approval'"
                content="Approve"
                placement="top"
              >
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                  @click="emit('approve', row)"
                >
                  <CheckCircle class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="can('payrolls.reject') && row.status === 'pending_approval'"
                content="Reject"
                placement="top"
              >
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  @click="emit('reject', row)"
                >
                  <XCircle class="h-4 w-4" />
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
