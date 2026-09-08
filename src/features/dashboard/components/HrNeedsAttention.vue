<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, BaseButton } from '@/components/common'
import type { DashboardPayrollBatch, PendingLeaveSection } from '../types/dashboard'
import { formatDashboardMonth, formatDashboardMoney } from '../utils/dashboardDisplay'

const props = defineProps<{
  pendingLeaves: PendingLeaveSection
  pendingPayroll: DashboardPayrollBatch | null
}>()

const emit = defineEmits<{
  reviewLeaves: []
  openPayroll: []
}>()

const hasQueue = computed(
  () => props.pendingLeaves.total > 0 || props.pendingPayroll != null,
)
</script>

<template>
  <AppCard v-if="hasQueue">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-slate-900">Needs attention</h2>
      <span class="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        Queue
      </span>
    </div>

    <div class="space-y-3">
      <div v-if="pendingLeaves.total > 0">
        <p class="text-sm font-medium text-slate-900">
          {{ pendingLeaves.total }} leave request{{ pendingLeaves.total === 1 ? '' : 's' }}
        </p>
        <p class="mt-0.5 text-xs text-slate-500">
          Earliest pending items awaiting HR action
        </p>
      </div>

      <div
        v-if="pendingLeaves.total > 0 && pendingPayroll"
        class="border-t border-gray-100"
      />

      <div v-if="pendingPayroll">
        <p class="text-sm font-medium text-slate-900">1 payroll batch</p>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ formatDashboardMonth(pendingPayroll.month, pendingPayroll.year) }} submitted —
          waiting for CEO
          <template v-if="pendingPayroll.totals">
            · net {{ formatDashboardMoney(pendingPayroll.totals.net_salary) }}
          </template>
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <BaseButton
        v-if="pendingLeaves.total > 0"
        type="primary"
        class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
        @click="emit('reviewLeaves')"
      >
        Review leaves
      </BaseButton>
      <BaseButton v-if="pendingPayroll" @click="emit('openPayroll')">Open payroll</BaseButton>
    </div>
  </AppCard>
</template>
