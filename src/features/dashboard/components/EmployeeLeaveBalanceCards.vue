<script setup lang="ts">
import { computed } from 'vue'
import { Calendar } from '@lucide/vue'
import { AppCard, AppChart } from '@/components/common'
import type { LeaveBalanceData } from '../types/dashboard'
import {
  formatLeaveTypeLabel,
  leaveBalanceTone,
  leaveUsedPercent,
} from '../utils/dashboardDisplay'
import {
  CHART_COLORS,
  chartAxisLabel,
  chartMutedAxisLabel,
  chartColorForLeave,
} from '@/utils/chartTheme'

const props = defineProps<{
  leaveBalance: LeaveBalanceData | null
}>()

const chartBalances = computed(() =>
  (props.leaveBalance?.balances ?? []).filter((b) => !b.is_unlimited),
)

const chartOption = computed(() => {
  const labels = chartBalances.value.map((b) => formatLeaveTypeLabel(b.leave_type))
  const used = chartBalances.value.map((b) => Number(b.used ?? 0))
  const remaining = chartBalances.value.map((b) => Number(b.remaining ?? 0))

  return {
    color: [CHART_COLORS.slateSoft, CHART_COLORS.emerald],
    legend: {
      top: 0,
      right: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: CHART_COLORS.label, fontSize: 11 },
    },
    grid: { left: 8, right: 8, top: 32, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: CHART_COLORS.axis } },
      axisLabel: {
        ...chartAxisLabel,
        interval: 0,
        formatter: (value: string) => value.replace(' Leave', ''),
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: CHART_COLORS.split } },
      axisLabel: chartMutedAxisLabel,
    },
    series: [
      {
        name: 'Used',
        type: 'bar',
        stack: 'leave',
        barWidth: '42%',
        data: used.map((value, index) => ({
          value,
          itemStyle: {
            color: chartColorForLeave(chartBalances.value[index]?.leave_type ?? ''),
            opacity: 0.45,
          },
        })),
      },
      {
        name: 'Remaining',
        type: 'bar',
        stack: 'leave',
        barWidth: '42%',
        data: remaining.map((value, index) => ({
          value,
          itemStyle: {
            color: chartColorForLeave(chartBalances.value[index]?.leave_type ?? ''),
            borderRadius: [6, 6, 0, 0],
          },
        })),
      },
    ],
  }
})
</script>

<template>
  <AppCard>
    <div class="mb-5 flex items-center gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
      >
        <Calendar class="h-5 w-5" />
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-800">Leave balance</p>
        <p class="text-xs text-slate-400">
          {{ leaveBalance?.year ?? new Date().getFullYear() }}
        </p>
      </div>
    </div>

    <template v-if="leaveBalance?.balances?.length">
      <AppChart
        v-if="chartBalances.length"
        class="mb-5"
        :option="chartOption"
        :height="208"
      />

      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="balance in leaveBalance.balances"
          :key="balance.leave_type"
          class="rounded-xl border p-4"
          :class="leaveBalanceTone(balance.leave_type).wrap"
        >
          <p class="mb-2 text-xs font-medium">{{ formatLeaveTypeLabel(balance.leave_type) }}</p>
          <template v-if="balance.is_unlimited">
            <p class="text-2xl font-bold">∞</p>
            <p class="mt-1 text-xs opacity-70">Unlimited</p>
          </template>
          <template v-else>
            <div class="flex items-end gap-1">
              <p class="text-2xl font-bold">{{ balance.remaining }}</p>
              <p class="mb-0.5 text-xs opacity-70">/ {{ balance.entitlement }}</p>
            </div>
            <p class="mt-1 text-xs opacity-70">{{ balance.used }} used</p>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/60">
              <div
                class="h-full rounded-full"
                :class="leaveBalanceTone(balance.leave_type).bar"
                :style="{ width: `${leaveUsedPercent(balance)}%` }"
              />
            </div>
          </template>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center py-8 text-center">
      <Calendar class="mb-3 h-10 w-10 text-slate-200" />
      <p class="text-sm font-medium text-slate-600">No leave balance data.</p>
    </div>
  </AppCard>
</template>
