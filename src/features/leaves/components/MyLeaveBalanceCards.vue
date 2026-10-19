<script setup lang="ts">
import { computed, watch } from 'vue'
import { Loader2 } from '@lucide/vue'
import { BaseButton } from '@/components/common'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermission } from '@/composables/usePermissions'
import { useLeaveBalances } from '../composables/useLeaveBalances'
import type { LeaveBalance, LeaveType } from '../types/leave'

const props = defineProps<{ refreshKey: number }>()
const auth = useAuthStore()
const { can } = usePermission()
const { balanceData, loading, loadBalances } = useLeaveBalances()
const year = new Date().getFullYear()
const canViewBalance = computed(() =>
  !!auth.user?.employee && (can('leave_balances.view_own') || can('leave_balances.view_any')),
)

const labels: Record<LeaveType, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  special: 'Special Leave',
  special_sick: 'Special Sick Leave',
  maternity: 'Maternity Leave',
  unpaid: 'Unpaid Leave',
}

function remainingPercent(balance: LeaveBalance) {
  const entitlement = Number(balance.entitlement)
  if (entitlement <= 0) return 0
  return Math.max(0, Math.min(100, (Number(balance.remaining) / entitlement) * 100))
}

function refresh() {
  if (!canViewBalance.value) return
  return loadBalances({ year, employee_id: auth.user?.employee?.employee_id })
}

watch([canViewBalance, () => props.refreshKey], refresh, { immediate: true })

function days(value: string | null) {
  return value == null ? '—' : Number(value).toLocaleString()
}
</script>

<template>
  <section
    v-if="canViewBalance"
    class="overflow-hidden rounded-xl border border-gray-200 bg-white"
    aria-labelledby="my-leave-balances"
    :aria-busy="loading"
  >
    <div class="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
      <h2 id="my-leave-balances" class="text-sm font-semibold text-slate-900">Leave balance</h2>
      <span class="text-xs tabular-nums text-slate-500">{{ balanceData?.year ?? year }}</span>
    </div>

    <div v-if="loading" class="flex items-center gap-2 px-5 py-10 text-sm text-slate-500" role="status">
      <Loader2 class="h-4 w-4 animate-spin text-emerald-600" />
      Loading leave balances...
    </div>

    <div v-else-if="balanceData?.balances.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="balance in balanceData.balances"
        :key="balance.leave_type"
        class="balance-item flex flex-col px-5 py-5 sm:px-6"
      >
        <h3 class="text-sm font-medium text-slate-600">{{ labels[balance.leave_type] }}</h3>

        <div class="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            class="font-semibold tracking-tight text-slate-900 tabular-nums"
            :class="balance.is_unlimited ? 'text-2xl' : 'text-3xl'"
          >{{ balance.is_unlimited ? 'Unlimited' : days(balance.remaining) }}</span>
          <span v-if="!balance.is_unlimited" class="text-xs text-slate-500">
            {{ balance.rule === 'per_case' ? 'days per case' : 'days left' }}
          </span>
        </div>

        <div class="mt-auto pt-4">
          <div
            v-if="!balance.is_unlimited && balance.rule !== 'per_case'"
            class="mb-3 h-1 overflow-hidden rounded-full bg-slate-100"
            aria-hidden="true"
          >
            <div class="h-full rounded-full bg-emerald-600" :style="{ width: `${remainingPercent(balance)}%` }" />
          </div>
          <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
            <span><span class="font-medium text-slate-700 tabular-nums">{{ days(balance.used) }}</span> days taken</span>
            <span v-if="balance.rule === 'per_case'">Per-case allowance</span>
            <span v-else-if="balance.is_unlimited">No annual limit</span>
            <span v-else>{{ days(balance.entitlement) }} {{ balance.rule === 'per_case_per_year' ? 'per case / year' : 'per year' }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="flex flex-wrap items-center justify-between gap-3 px-5 py-6">
      <p class="text-sm text-slate-500">Leave balances are unavailable.</p>
      <BaseButton @click="refresh">Retry</BaseButton>
    </div>

    <p v-if="balanceData?.balances.length && !loading" class="border-t border-gray-100 px-5 py-3 text-xs text-slate-500">
      Only approved requests count toward days taken.
    </p>
  </section>
</template>

<style scoped>
.balance-item + .balance-item {
  border-top: 1px solid var(--color-gray-100);
}

@media (min-width: 640px) {
  .balance-item + .balance-item {
    border-top: 0;
  }

  .balance-item:nth-child(n + 3) {
    border-top: 1px solid var(--color-gray-100);
  }

  .balance-item:nth-child(2n) {
    border-left: 1px solid var(--color-gray-100);
  }
}

@media (min-width: 1280px) {
  .balance-item:nth-child(n) {
    border: 0;
  }

  .balance-item:nth-child(n + 4) {
    border-top: 1px solid var(--color-gray-100);
  }

  .balance-item:not(:nth-child(3n + 1)) {
    border-left: 1px solid var(--color-gray-100);
  }
}
</style>
