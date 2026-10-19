<script setup lang="ts">
import { computed, watch } from 'vue'
import { CalendarDays, Loader2 } from '@lucide/vue'
import { AppCard, BaseButton } from '@/components/common'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermission } from '@/composables/usePermissions'
import { useLeaveBalances } from '../composables/useLeaveBalances'
import type { LeaveType } from '../types/leave'

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
const tones: Record<LeaveType, string> = {
  annual: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  sick: 'border-blue-100 bg-blue-50 text-blue-700',
  special: 'border-amber-100 bg-amber-50 text-amber-700',
  special_sick: 'border-rose-100 bg-rose-50 text-rose-700',
  maternity: 'border-purple-100 bg-purple-50 text-purple-700',
  unpaid: 'border-slate-200 bg-slate-50 text-slate-700',
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
  <section v-if="canViewBalance" aria-labelledby="my-leave-balances" :aria-busy="loading">
    <div class="mb-3">
      <h2 id="my-leave-balances" class="text-sm font-semibold text-slate-800">
        My Leave Balances · {{ balanceData?.year ?? year }}
      </h2>
      <p class="mt-1 text-xs text-slate-500">Days taken count approved requests only.</p>
    </div>

    <AppCard v-if="loading">
      <div class="flex items-center gap-2 text-sm text-slate-500" role="status">
        <Loader2 class="h-4 w-4 animate-spin text-emerald-600" />
        Loading leave balances...
      </div>
    </AppCard>

    <div v-else-if="balanceData?.balances.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="balance in balanceData.balances"
        :key="balance.leave_type"
        class="rounded-xl border p-5"
        :class="tones[balance.leave_type]"
      >
        <div class="mb-4 flex items-center gap-2">
          <CalendarDays class="h-4 w-4 shrink-0" />
          <h3 class="text-sm font-semibold">{{ labels[balance.leave_type] }}</h3>
        </div>
        <dl class="grid grid-cols-2 gap-4">
          <div>
            <dt class="text-xs opacity-80">Days taken</dt>
            <dd class="mt-1 text-2xl font-bold">{{ days(balance.used) }}</dd>
          </div>
          <div>
            <dt class="text-xs opacity-80">{{ balance.rule === 'per_case' ? 'Days per case' : 'Days remaining' }}</dt>
            <dd class="mt-1 text-2xl font-bold">
              {{ balance.is_unlimited ? 'Unlimited' : days(balance.remaining) }}
            </dd>
          </div>
        </dl>
        <p class="mt-4 text-xs opacity-80">
          <template v-if="balance.is_unlimited">No balance limit</template>
          <template v-else-if="balance.rule === 'per_case'">{{ days(balance.entitlement) }} days allowed per case</template>
          <template v-else-if="balance.rule === 'per_case_per_year'">{{ days(balance.entitlement) }} days per case / year</template>
          <template v-else>{{ days(balance.entitlement) }} days entitled per year</template>
        </p>
      </div>
    </div>

    <AppCard v-else>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-500">Leave balances are unavailable.</p>
        <BaseButton @click="refresh">Retry</BaseButton>
      </div>
    </AppCard>
  </section>
</template>
