<script setup lang="ts">
import { computed } from 'vue'
import { Download } from '@lucide/vue'
import { AppCard, BaseButton } from '@/components/common'
import type { Payslip } from '../types/payslip'
import {
  attendanceBarPercents,
  attendanceSummary,
  formatPayslipDays,
  formatPayslipMoney,
  formatPayslipPeriod,
  formatPayslipTaxRate,
} from '../utils/payslipDisplay'

const props = defineProps<{
  payslip: Payslip
  downloadLoading?: boolean
  canDownload: boolean
}>()

const emit = defineEmits<{
  view: [payslip: Payslip]
  download: [payslip: Payslip]
}>()

const bar = computed(() => attendanceBarPercents(props.payslip))
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Latest payslip</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">
          {{ formatPayslipPeriod(payslip.payroll_batch.month, payslip.payroll_batch.year) }}
        </h2>
      </div>
      <span class="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Approved
      </span>
    </div>

    <p class="mt-2 text-sm text-slate-500">
      {{ payslip.employee.full_name }} · {{ payslip.employee.employee_id }}. Net is the take-home
      figure from the approved payroll item.
    </p>

    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <BaseButton
            v-if="canDownload"
            type="primary"
            class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
            :loading="downloadLoading"
            @click="emit('download', payslip)"
          >
            <Download class="mr-1.5 h-4 w-4" />
            Download PDF
          </BaseButton>
          <BaseButton @click="emit('view', payslip)">View breakdown</BaseButton>
        </div>

        <div>
          <div class="mb-1.5 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Attendance · {{ formatPayslipDays(payslip.present_days) }} of
              {{ formatPayslipDays(payslip.working_days) }} working days
            </span>
            <span>{{ attendanceSummary(payslip) }}</span>
          </div>
          <div class="flex h-2 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full bg-emerald-500" :style="{ width: `${bar.present}%` }" />
            <div class="h-full bg-amber-400" :style="{ width: `${bar.unpaid}%` }" />
            <div class="h-full bg-red-500" :style="{ width: `${bar.absent}%` }" />
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-2xl font-semibold text-slate-900">
            {{ formatPayslipMoney(payslip.net_salary) }}
          </p>
          <p class="text-sm text-slate-500">Net salary</p>
        </div>
        <p class="rounded-lg border border-gray-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Gross {{ formatPayslipMoney(payslip.gross_salary) }} · tax
          {{ formatPayslipMoney(payslip.tax_amount) }} ({{
            formatPayslipTaxRate(payslip.tax_rate)
          }}) · NSSF {{ formatPayslipMoney(payslip.nssf_deduction) }}
        </p>
      </div>
    </div>
  </AppCard>
</template>
