<script setup lang="ts">
import { Clock, FileText, CircleX, Banknote } from '@lucide/vue'
import type { PayrollBatch, PayrollStatusCounts } from '../types/payroll'
import { formatPayrollMoney, formatPayrollPeriod } from '../utils/payrollDisplay'

defineProps<{
  counts: PayrollStatusCounts
  lastApproved: PayrollBatch | null
  loading: boolean
}>()
</script>

<template>
  <div v-if="loading" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div
      v-for="n in 4"
      :key="n"
      class="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
    />
  </div>

  <div v-else class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            counts.pending_approval > 0
              ? 'bg-amber-50 text-amber-600'
              : 'bg-slate-100 text-slate-600'
          "
        >
          <Clock class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="counts.pending_approval > 0 ? 'text-amber-600' : 'text-slate-900'"
          >
            {{ counts.pending_approval }}
          </p>
          <p class="text-sm text-slate-500">Awaiting approval</p>
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
          <p class="text-2xl font-semibold text-slate-900">{{ counts.draft }}</p>
          <p class="text-sm text-slate-500">Draft batches</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="counts.rejected > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'"
        >
          <CircleX class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="counts.rejected > 0 ? 'text-red-600' : 'text-slate-900'"
          >
            {{ counts.rejected }}
          </p>
          <p class="text-sm text-slate-500">Rejected</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <Banknote class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">
            {{ lastApproved ? formatPayrollMoney(lastApproved.totals?.net_salary) : '—' }}
          </p>
          <p class="text-sm text-slate-500">
            Last approved
            <template v-if="lastApproved">
              · {{ formatPayrollPeriod(lastApproved.month, lastApproved.year) }}
            </template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
