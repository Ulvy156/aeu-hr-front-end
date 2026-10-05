<script setup lang="ts">
import { AlertCircle, Banknote, CheckCircle } from '@lucide/vue'
import { AppCard, BaseButton } from '@/components/common'
import type { DashboardPayrollBatch } from '../types/dashboard'
import { formatDashboardMoney, formatDashboardMonth } from '../utils/dashboardDisplay'

defineProps<{
  pendingCount: number
  latestBatch: DashboardPayrollBatch | null
  recentBatches: DashboardPayrollBatch[]
  canApprove: boolean
  canReject: boolean
  actionLoading?: boolean
}>()

const emit = defineEmits<{
  approve: [batch: DashboardPayrollBatch]
  reject: [batch: DashboardPayrollBatch]
  view: [batch: DashboardPayrollBatch]
}>()
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="latestBatch"
      class="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4"
    >
      <AlertCircle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div>
        <p class="text-sm font-semibold text-amber-800">
          {{ canApprove ? 'Action required — payroll' : 'Payroll awaiting approval' }}
        </p>
        <p class="mt-1 text-sm text-amber-700">
          {{ formatDashboardMonth(latestBatch.month, latestBatch.year) }} is waiting for
          {{ canApprove ? 'your' : 'CEO' }} approval · {{ latestBatch.item_count }} employees
          <template v-if="latestBatch.totals">
            · net {{ formatDashboardMoney(latestBatch.totals.net_salary) }}
          </template>
        </p>
      </div>
    </div>

    <div
      v-else
      class="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4"
    >
      <CheckCircle class="h-5 w-5 shrink-0 text-emerald-600" />
      <p class="text-sm text-emerald-700">
        No payroll batches pending {{ canApprove ? 'your' : 'CEO' }} approval.
      </p>
    </div>

    <AppCard>
      <div class="mb-4 flex items-center gap-2">
        <Banknote class="h-4 w-4 text-slate-400" />
        <h2 class="text-base font-semibold text-slate-900">
          {{ canApprove ? 'Payroll approval' : 'Payroll overview' }}
        </h2>
      </div>

      <p
        class="text-3xl font-bold"
        :class="pendingCount > 0 ? 'text-amber-500' : 'text-emerald-600'"
      >
        {{ pendingCount }}
      </p>
      <p class="mt-1 text-sm text-slate-500">
        Batches pending {{ canApprove ? 'your' : 'CEO' }} approval
      </p>

      <div v-if="latestBatch" class="mt-4 flex flex-wrap gap-2">
        <BaseButton
          v-if="canApprove"
          type="primary"
          class="!border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700"
          :loading="actionLoading"
          @click="emit('approve', latestBatch)"
        >
          Approve
        </BaseButton>
        <BaseButton
          v-if="canReject"
          type="danger"
          plain
          :disabled="actionLoading"
          @click="emit('reject', latestBatch)"
        >
          Reject
        </BaseButton>
        <BaseButton :disabled="actionLoading" @click="emit('view', latestBatch)">
          Open detail
        </BaseButton>
      </div>

      <div
        v-if="recentBatches.length > 0"
        class="mt-5 divide-y divide-gray-100 border-t border-gray-100 pt-3"
      >
        <div
          v-for="batch in recentBatches"
          :key="batch.id"
          class="flex items-center justify-between py-2.5"
        >
          <p class="text-sm font-medium text-slate-700">
            {{ formatDashboardMonth(batch.month, batch.year) }}
          </p>
          <span class="text-xs text-slate-400">{{ batch.item_count }} employees</span>
        </div>
      </div>
    </AppCard>
  </div>
</template>
