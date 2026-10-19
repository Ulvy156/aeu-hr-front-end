<script setup lang="ts">
import { Calendar } from '@lucide/vue'
import type { LeaveBalance } from '../types/leave'

withDefaults(defineProps<{ balances: LeaveBalance[]; columns?: 3 | 4; compact?: boolean }>(), {
  columns: 4,
  compact: false,
})

function getBarColor(leaveType: string): string {
  const colors: Record<string, string> = {
    annual: 'bg-emerald-500',
    sick: 'bg-blue-500',
    special: 'bg-amber-500',
    special_sick: 'bg-rose-500',
    maternity: 'bg-purple-500',
    unpaid: 'bg-slate-500',
  }
  return colors[leaveType] ?? 'bg-slate-500'
}

function getBalanceBg(leaveType: string): string {
  const map: Record<string, string> = {
    annual: 'bg-emerald-50 border-emerald-100',
    sick: 'bg-blue-50 border-blue-100',
    special: 'bg-amber-50 border-amber-100',
    special_sick: 'bg-rose-50 border-rose-100',
    maternity: 'bg-purple-50 border-purple-100',
    unpaid: 'bg-slate-50 border-slate-100',
  }
  return map[leaveType] ?? 'bg-slate-50 border-slate-100'
}

function getIconColor(leaveType: string): string {
  const map: Record<string, string> = {
    annual: 'text-emerald-600',
    sick: 'text-blue-600',
    special: 'text-amber-600',
    special_sick: 'text-rose-600',
    maternity: 'text-purple-600',
    unpaid: 'text-slate-500',
  }
  return map[leaveType] ?? 'text-slate-500'
}

const leaveTypeLabels: Record<string, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  special: 'Special Leave',
  special_sick: 'Special Sick Leave',
  maternity: 'Maternity Leave',
  unpaid: 'Unpaid Leave',
}

function formatLeaveType(type: string): string {
  return leaveTypeLabels[type] ?? type
}

const ruleLabels: Record<string, string> = {
  per_year: 'Per Year',
  per_case: 'Per Case',
  per_case_per_year: 'Per Case / Year',
  unlimited: 'Unlimited',
}

function formatRule(rule: string): string {
  return ruleLabels[rule] ?? rule
}

function getUsedPercent(balance: LeaveBalance): number {
  if (balance.is_unlimited || !balance.entitlement) return 0
  const entitlement = parseFloat(balance.entitlement)
  const used = parseFloat(balance.used ?? '0')
  return entitlement > 0 ? Math.min(100, Math.round((used / entitlement) * 100)) : 0
}
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4"
    :class="columns === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'"
  >
    <div
      v-for="balance in balances"
      :key="balance.leave_type"
      class="bg-white border border-gray-200 rounded-xl shadow-sm"
      :class="compact ? 'p-4' : 'p-5'"
    >
      <template v-if="compact">
        <div class="flex items-center gap-3">
          <div
            class="h-8 w-8 shrink-0 rounded-lg border flex items-center justify-center"
            :class="getBalanceBg(balance.leave_type)"
          >
            <Calendar class="w-4 h-4" :class="getIconColor(balance.leave_type)" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs text-slate-400">{{ formatLeaveType(balance.leave_type) }}</p>
            <p class="mt-0.5 text-lg font-bold text-slate-900">
              {{ balance.is_unlimited ? '∞' : balance.remaining }}
              <span class="text-xs font-normal text-slate-400">{{
                balance.is_unlimited
                  ? 'Unlimited'
                  : balance.rule === 'per_case'
                    ? 'days per case'
                    : 'days left'
              }}</span>
            </p>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs text-slate-400">
          <span>{{ balance.used ?? '0.00' }} days used</span>
          <span>{{ formatRule(balance.rule) }}</span>
        </div>
      </template>

      <template v-else>
        <div class="flex items-center justify-between mb-3">
          <div
            class="h-9 w-9 rounded-lg border flex items-center justify-center"
            :class="getBalanceBg(balance.leave_type)"
          >
            <Calendar class="w-4 h-4" :class="getIconColor(balance.leave_type)" />
          </div>
          <span
            v-if="balance.is_unlimited"
            class="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5"
          >
            Unlimited
          </span>
        </div>

        <p class="text-xs text-slate-400 mb-1">{{ formatLeaveType(balance.leave_type) }}</p>

        <template v-if="balance.is_unlimited">
          <p class="text-2xl font-bold text-slate-900">∞</p>
          <p class="text-xs text-slate-400 mt-1">No balance limit</p>
          <p class="text-xs text-slate-400 mt-1">{{ balance.used ?? '0.00' }} days used</p>
        </template>

        <template v-else>
          <div class="flex items-end gap-1">
            <p class="text-2xl font-bold text-slate-900">{{ balance.remaining }}</p>
            <p class="text-sm text-slate-400 mb-0.5">/ {{ balance.entitlement }} days</p>
          </div>
          <p class="text-xs text-slate-400 mt-1">{{ balance.used }} days used</p>

          <!-- Progress bar -->
          <div class="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="
                getUsedPercent(balance) >= 80 ? 'bg-red-400' : getBarColor(balance.leave_type)
              "
              :style="{ width: `${getUsedPercent(balance)}%` }"
            />
          </div>
          <p class="text-xs text-slate-400 mt-1">
            {{ getUsedPercent(balance) }}% used · {{ formatRule(balance.rule) }}
          </p>
        </template>
      </template>
    </div>
  </div>
</template>
