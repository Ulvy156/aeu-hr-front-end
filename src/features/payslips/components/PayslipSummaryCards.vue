<script setup lang="ts">
import { Banknote, Calendar, FileText } from '@lucide/vue'
import type { Payslip, PayslipYearCounts } from '../types/payslip'
import { PAYSLIP_YEAR_PILLS } from '../types/payslip'
import {
  attendanceSummary,
  formatPayslipDays,
  formatPayslipMoney,
  formatPayslipPeriod,
} from '../utils/payslipDisplay'

defineProps<{
  counts: PayslipYearCounts
  latest: Payslip | null
  filteredTotal: number
  isOwnView: boolean
  loading: boolean
}>()

const thisYear = PAYSLIP_YEAR_PILLS[0]
</script>

<template>
  <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div
      v-for="n in 3"
      :key="n"
      class="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
    />
  </div>

  <div v-else-if="isOwnView" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <Banknote class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">
            {{ latest ? formatPayslipMoney(latest.net_salary) : '—' }}
          </p>
          <p class="text-sm text-slate-500">
            Latest net
            <template v-if="latest">
              · {{ formatPayslipPeriod(latest.payroll_batch.month, latest.payroll_batch.year) }}
            </template>
          </p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <FileText class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ counts.years[thisYear] ?? 0 }}</p>
          <p class="text-sm text-slate-500">Payslips in {{ thisYear }}</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <Calendar class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">
            <template v-if="latest">
              {{ formatPayslipDays(latest.present_days) }} /
              {{ formatPayslipDays(latest.working_days) }}
            </template>
            <template v-else>—</template>
          </p>
          <p class="text-sm text-slate-500">
            {{ latest ? attendanceSummary(latest) : 'Latest attendance' }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <FileText class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ filteredTotal }}</p>
          <p class="text-sm text-slate-500">Payslips in view</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <Calendar class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">
            {{
              latest
                ? formatPayslipPeriod(latest.payroll_batch.month, latest.payroll_batch.year)
                : '—'
            }}
          </p>
          <p class="text-sm text-slate-500">Newest period</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <FileText class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ counts.years[thisYear] ?? 0 }}</p>
          <p class="text-sm text-slate-500">Payslips in {{ thisYear }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
