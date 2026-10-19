<script setup lang="ts">
import { computed } from 'vue'
import { Banknote, Minus, Wallet } from '@lucide/vue'
import type { PayrollBatch, PayrollTotals } from '../types/payroll'
import { formatPayrollMoney } from '../utils/payrollDisplay'

const props = defineProps<{ payroll: PayrollBatch }>()
const currency = computed(() => props.payroll.currency?.trim().toUpperCase())
const deductionCards = [
  {
    key: 'unpaid_deduction',
    label: 'Unpaid leave',
    description: 'Pay deducted for unpaid leave days.',
  },
  { key: 'absence_deduction', label: 'Absence', description: 'Pay deducted for absent days.' },
  {
    key: 'maternity_deduction',
    label: 'Maternity leave',
    description: 'Pay deducted under the maternity leave policy.',
  },
  {
    key: 'special_sick_deduction',
    label: 'Special sick leave',
    description: 'Pay deducted under the special sick leave policy.',
  },
  { key: 'tax_amount', label: 'Salary tax', description: 'Tax withheld from employee pay.' },
  {
    key: 'nssf_deduction',
    label: 'NSSF contribution',
    description: 'Employee contributions to the National Social Security Fund.',
  },
] satisfies { key: keyof PayrollTotals; label: string; description: string }[]

const totalDeductions = computed(() => {
  if (!props.payroll.totals) return undefined
  const amounts = deductionCards.map((card) => props.payroll.totals[card.key])
  if (amounts.some((amount) => amount == null || amount === '' || !Number.isFinite(Number(amount))))
    return undefined
  // Add monetary amounts as cents to avoid floating-point rounding differences.
  return amounts.reduce((sum, amount) => sum + Math.round(Number(amount) * 100), 0) / 100
})

const overviewCards = computed(() => [
  {
    label: 'Gross pay',
    value: props.payroll.totals?.gross_salary,
    description: 'Total employee earnings before deductions.',
    icon: Banknote,
    tone: 'border-slate-100 bg-slate-50 text-slate-600',
    net: false,
  },
  {
    label: 'Total deductions',
    value: totalDeductions.value,
    description: 'Leave, absence, tax and NSSF deductions combined.',
    icon: Minus,
    tone: 'border-amber-100 bg-amber-50 text-amber-600',
    net: false,
  },
  {
    label: 'Net pay',
    value: props.payroll.totals?.net_salary,
    description: 'Amount payable to employees after all deductions.',
    icon: Wallet,
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    net: true,
  },
])
</script>

<template>
  <section aria-labelledby="payroll-totals">
    <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="payroll-totals" class="text-sm font-semibold text-slate-800">Payroll totals</h2>
      <p class="text-xs text-slate-500">
        Across {{ payroll.item_count }} {{ payroll.item_count === 1 ? 'employee' : 'employees' }} ·
        {{ currency ? `All amounts in ${currency}` : 'Currency not specified' }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article
        v-for="card in overviewCards"
        :key="card.label"
        class="rounded-xl border bg-white p-5 shadow-sm"
        :class="card.net ? 'border-emerald-200' : 'border-gray-200'"
      >
        <div
          class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border"
          :class="card.tone"
        >
          <component :is="card.icon" class="h-4 w-4" />
        </div>
        <h3 class="text-xs text-slate-500">{{ card.label }}</h3>
        <p
          class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1"
          :class="card.net ? 'text-emerald-700' : 'text-slate-900'"
        >
          <span v-if="currency" class="text-xs font-medium">{{ currency }}</span>
          <span class="text-2xl font-bold tabular-nums">{{ formatPayrollMoney(card.value) }}</span>
        </p>
        <p class="mt-2 text-xs leading-5 text-slate-500">{{ card.description }}</p>
      </article>
    </div>

    <div class="mb-3 mt-5 flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="text-sm font-semibold text-slate-800">Deduction breakdown</h3>
      <p class="text-xs text-slate-500">
        These amounts are already included in total deductions above.
      </p>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="card in deductionCards"
        :key="card.key"
        class="rounded-xl border border-gray-200 bg-white p-4"
      >
        <h4 class="text-xs text-slate-500">{{ card.label }}</h4>
        <p class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-slate-800">
          <span v-if="currency" class="text-xs font-medium text-slate-500">{{ currency }}</span>
          <span class="text-lg font-semibold tabular-nums">{{
            formatPayrollMoney(payroll.totals?.[card.key])
          }}</span>
        </p>
        <p class="mt-1 text-xs leading-5 text-slate-500">{{ card.description }}</p>
      </article>
    </div>
  </section>
</template>
