<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, AppChart } from '@/components/common'
import type { PayrollStatusCounts } from '../types/dashboard'
import {
  CHART_COLORS,
  chartAxisLabel,
  chartMutedAxisLabel,
} from '@/utils/chartTheme'

const props = defineProps<{
  counts: PayrollStatusCounts
}>()

const legend = computed(() => [
  { key: 'draft', label: 'Draft', value: props.counts.draft, color: CHART_COLORS.blue },
  {
    key: 'pending',
    label: 'Pending',
    value: props.counts.pending_approval,
    color: CHART_COLORS.amber,
  },
  {
    key: 'approved',
    label: 'Approved',
    value: props.counts.approved,
    color: CHART_COLORS.emerald,
  },
  {
    key: 'rejected',
    label: 'Rejected',
    value: props.counts.rejected,
    color: CHART_COLORS.red,
  },
])

const chartOption = computed(() => ({
  grid: { left: 8, right: 16, top: 8, bottom: 8, containLabel: true },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
  },
  xAxis: {
    type: 'value',
    minInterval: 1,
    splitLine: { lineStyle: { color: CHART_COLORS.split } },
    axisLabel: chartMutedAxisLabel,
  },
  yAxis: {
    type: 'category',
    data: legend.value.map((item) => item.label),
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: chartAxisLabel,
  },
  series: [
    {
      name: 'Batches',
      type: 'bar',
      barWidth: 14,
      data: legend.value.map((item) => ({
        value: item.value,
        itemStyle: { color: item.color, borderRadius: [0, 6, 6, 0] },
      })),
    },
  ],
}))
</script>

<template>
  <AppCard>
    <h2 class="mb-1 text-base font-semibold text-slate-900">Payroll pipeline</h2>
    <p class="mb-4 text-sm text-slate-500">Batch status counts from the HR dashboard API.</p>

    <AppChart :option="chartOption" :height="176" />

    <div class="mt-3 grid grid-cols-2 gap-3">
      <div
        v-for="item in legend"
        :key="item.key"
        class="rounded-lg border border-gray-100 bg-slate-50 p-3"
      >
        <div class="mb-1 flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: item.color }" />
          <p class="text-xs text-slate-500">{{ item.label }}</p>
        </div>
        <p
          class="text-lg font-semibold"
          :class="
            item.key === 'pending' && item.value > 0
              ? 'text-amber-600'
              : item.key === 'approved'
                ? 'text-emerald-600'
                : item.key === 'rejected' && item.value > 0
                  ? 'text-red-600'
                  : 'text-slate-900'
          "
        >
          {{ item.value }}
        </p>
      </div>
    </div>
  </AppCard>
</template>
