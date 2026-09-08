<script setup lang="ts">
import { computed } from 'vue'
import type { Payslip } from '../types/payslip'
import { formatPayslipDays, formatPayslipMoney, formatPayslipPeriod } from '../utils/payslipDisplay'

const props = defineProps<{
  payslips: Payslip[]
}>()

const emit = defineEmits<{
  view: [payslip: Payslip]
}>()

const recent = computed(() => props.payslips.slice(0, 6))
</script>

<template>
  <div v-if="recent.length" class="border-t border-gray-100 p-5 lg:border-t-0 lg:border-l">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-slate-900">History</h2>
      <span class="text-xs text-slate-400">{{ payslips.length }} slips</span>
    </div>

    <div class="divide-y divide-gray-100">
      <button
        v-for="row in recent"
        :key="row.id"
        type="button"
        class="block w-full py-3 text-left transition-colors first:pt-0 last:pb-0 hover:bg-gray-50"
        @click="emit('view', row)"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="truncate text-sm font-medium text-slate-900">
            {{ formatPayslipPeriod(row.payroll_batch.month, row.payroll_batch.year) }}
          </p>
          <p class="shrink-0 text-sm font-semibold text-slate-800">
            {{ formatPayslipMoney(row.net_salary) }}
          </p>
        </div>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ formatPayslipDays(row.present_days) }} / {{ formatPayslipDays(row.working_days) }} days
        </p>
      </button>
    </div>
  </div>
</template>
