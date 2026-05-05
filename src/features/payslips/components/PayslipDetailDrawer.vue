<script setup lang="ts">
import { computed } from 'vue'
import { Download } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { StatusBadge, BaseButton } from '@/components/common'
import type { Payslip } from '../types/payslip'

const props = defineProps<{
  visible: boolean
  payslip: Payslip | null
  detailLoading?: boolean
  downloadLoading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  download: [payslip: Payslip]
}>()

const { can } = usePermission()

const canDownload = computed(() => can('payslips.download_any') || can('payslips.download_own'))

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

function formatNumber(value: string | undefined): string {
  if (!value) return '—'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPercent(value: string | undefined): string {
  if (!value) return '—'
  return `${Number(value).toFixed(2)}%`
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="Payslip Detail"
    direction="rtl"
    size="520px"
    :before-close="() => emit('update:visible', false)"
    destroy-on-close
  >
    <!-- Loading -->
    <div v-if="detailLoading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="payslip" class="space-y-5">
      <!-- Employee info -->
      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
          {{ payslip.employee.full_name.charAt(0) }}
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">{{ payslip.employee.full_name }}</p>
          <p class="text-xs text-slate-400">{{ payslip.employee.employee_id }}</p>
        </div>
        <div class="ml-auto text-right">
          <p class="text-xs text-slate-400 mb-0.5">Period</p>
          <p class="text-sm font-semibold text-slate-700">
            {{ formatMonth(payslip.payroll_batch.month) }} {{ payslip.payroll_batch.year }}
          </p>
        </div>
      </div>

      <!-- Attendance summary -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Attendance</h4>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Working Days</p>
            <p class="font-semibold text-slate-800">{{ formatNumber(payslip.working_days) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Present Days</p>
            <p class="font-semibold text-emerald-700">{{ formatNumber(payslip.present_days) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Absent Days</p>
            <p class="font-semibold text-red-600">{{ formatNumber(payslip.absent_days) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Unpaid Leave</p>
            <p class="font-semibold text-amber-600">{{ formatNumber(payslip.unpaid_leave_days) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Daily Rate</p>
            <p class="font-semibold text-slate-800">{{ formatMoney(payslip.daily_rate) }}</p>
          </div>
        </div>
      </div>

      <!-- Earnings & Deductions -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Earnings & Deductions</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Base Salary</span>
            <span class="font-medium text-slate-800">{{ formatMoney(payslip.base_salary) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Gross Salary</span>
            <span class="font-medium text-slate-800">{{ formatMoney(payslip.gross_salary) }}</span>
          </div>
          <div class="border-t border-gray-100 pt-2 flex justify-between">
            <span class="text-slate-500">Unpaid Deduction</span>
            <span class="font-medium text-red-600">− {{ formatMoney(payslip.unpaid_deduction) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Absence Deduction</span>
            <span class="font-medium text-red-600">− {{ formatMoney(payslip.absence_deduction) }}</span>
          </div>
          <div class="border-t border-gray-100 pt-2 flex justify-between">
            <span class="text-slate-500">Taxable Salary</span>
            <span class="font-medium text-slate-800">{{ formatMoney(payslip.taxable_salary) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Tax Rate</span>
            <span class="font-medium text-amber-600">{{ formatPercent(payslip.tax_rate) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Tax Amount</span>
            <span class="font-medium text-amber-600">− {{ formatMoney(payslip.tax_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Net salary highlight -->
      <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-center justify-between">
        <p class="text-sm font-semibold text-emerald-800">Net Salary</p>
        <p class="text-2xl font-bold text-emerald-700">{{ formatMoney(payslip.net_salary) }}</p>
      </div>

      <!-- Batch status -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-500">Payroll Status</span>
        <StatusBadge :status="payslip.payroll_batch.status" />
      </div>

      <!-- Download button -->
      <div v-if="canDownload" class="pt-2">
        <BaseButton
          class="w-full"
          :loading="downloadLoading"
          @click="emit('download', payslip)"
        >
          <Download class="w-4 h-4 mr-2" />
          Download PDF
        </BaseButton>
      </div>
    </div>

    <div v-else class="flex items-center justify-center py-20 text-slate-400 text-sm">
      No payslip selected.
    </div>
  </el-drawer>
</template>
