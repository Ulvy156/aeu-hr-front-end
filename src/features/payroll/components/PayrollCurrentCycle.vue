<script setup lang="ts">
import { AppCard, BaseButton } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import type { PayrollBatch } from '../types/payroll'
import {
  displayedDeductionTotal,
  formatPayrollDate,
  formatPayrollMoney,
  formatPayrollPeriod,
} from '../utils/payrollDisplay'

defineProps<{
  payroll: PayrollBatch
}>()

const emit = defineEmits<{
  view: [payroll: PayrollBatch]
  approve: [payroll: PayrollBatch]
  reject: [payroll: PayrollBatch]
}>()

const { can } = usePermission()
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Current cycle</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">
          {{ formatPayrollPeriod(payroll.month, payroll.year) }}
        </h2>
      </div>
      <span class="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        Pending approval
      </span>
    </div>

    <p class="mt-2 text-sm text-slate-500">
      <template v-if="payroll.submitted_at">
        Submitted {{ formatPayrollDate(payroll.submitted_at) }}.
      </template>
      Waiting for CEO approval. Payslips stay hidden until this batch is approved.
    </p>

    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-if="can('payrolls.approve')"
          type="primary"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          @click="emit('approve', payroll)"
        >
          Approve
        </BaseButton>
        <BaseButton
          v-if="can('payrolls.reject')"
          type="danger"
          plain
          @click="emit('reject', payroll)"
        >
          Reject
        </BaseButton>
        <BaseButton @click="emit('view', payroll)">Open detail</BaseButton>
      </div>

      <div class="space-y-3">
        <div class="flex gap-8">
          <div>
            <p class="text-2xl font-semibold text-slate-900">{{ payroll.item_count }}</p>
            <p class="text-sm text-slate-500">Employees</p>
          </div>
          <div>
            <p class="text-2xl font-semibold text-slate-900">
              {{ formatPayrollMoney(payroll.totals?.net_salary) }}
            </p>
            <p class="text-sm text-slate-500">Net payroll</p>
          </div>
        </div>
        <p class="rounded-lg border border-gray-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Gross {{ formatPayrollMoney(payroll.totals?.gross_salary) }} · deductions
          {{ displayedDeductionTotal(payroll.totals) }}
        </p>
      </div>
    </div>
  </AppCard>
</template>
