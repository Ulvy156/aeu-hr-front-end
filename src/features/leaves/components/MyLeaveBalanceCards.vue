<script setup lang="ts">
import { computed, watch } from 'vue'
import { Loader2 } from '@lucide/vue'
import { BaseButton } from '@/components/common'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermission } from '@/composables/usePermissions'
import { useLeaveBalances } from '../composables/useLeaveBalances'
import LeaveBalanceCards from './LeaveBalanceCards.vue'

const props = defineProps<{ refreshKey: number }>()
const auth = useAuthStore()
const { can } = usePermission()
const { balanceData, loading, loadBalances } = useLeaveBalances()
const year = new Date().getFullYear()
const primaryTypes = ['annual', 'sick', 'special']
const primaryBalances = computed(() =>
  (balanceData.value?.balances ?? []).filter((balance) =>
    primaryTypes.includes(balance.leave_type),
  ),
)
const otherBalances = computed(() =>
  (balanceData.value?.balances ?? []).filter(
    (balance) => !primaryTypes.includes(balance.leave_type),
  ),
)
const canViewBalance = computed(
  () => !!auth.user?.employee && (can('leave_balances.view_own') || can('leave_balances.view_any')),
)

function refresh() {
  if (!canViewBalance.value) return
  return loadBalances({ year, employee_id: auth.user?.employee?.employee_id })
}

watch([canViewBalance, () => props.refreshKey], refresh, { immediate: true })
</script>

<template>
  <section v-if="canViewBalance" aria-labelledby="my-leave-balances" :aria-busy="loading">
    <div class="mb-3 flex items-baseline justify-between gap-4">
      <h2 id="my-leave-balances" class="text-sm font-semibold text-slate-800">Your balances</h2>
      <span class="text-xs text-slate-500">{{ balanceData?.year ?? year }} allowance</span>
    </div>

    <div
      v-if="loading"
      class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-10 text-sm text-slate-500"
      role="status"
    >
      <Loader2 class="h-4 w-4 animate-spin text-emerald-600" />
      Loading leave balances...
    </div>

    <template v-else-if="balanceData?.balances.length">
      <LeaveBalanceCards :balances="primaryBalances" :columns="3" />
      <LeaveBalanceCards
        v-if="otherBalances.length"
        class="mt-4"
        :balances="otherBalances"
        :columns="3"
        compact
      />
      <p class="mt-2.5 text-xs text-slate-500">Taken days include approved requests only.</p>
    </template>

    <div
      v-else
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-6"
    >
      <p class="text-sm text-slate-500">Leave balances are unavailable.</p>
      <BaseButton @click="refresh">Retry</BaseButton>
    </div>
  </section>
</template>
