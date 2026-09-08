<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, AppChart } from '@/components/common'
import type { AttendanceSummary } from '../types/dashboard'
import {
  CHART_STATUS_PALETTE,
  chartAxisLabel,
  chartMutedAxisLabel,
  CHART_COLORS,
} from '@/utils/chartTheme'

const props = defineProps<{
  summary: AttendanceSummary
}>()

const categories = ['Present', 'Late', 'Absent', 'Missing out'] as const

const chartOption = computed(() => {
  const values = [
    props.summary.present_count,
    props.summary.late_count,
    props.summary.absent_count,
    props.summary.missing_clock_out_count,
  ]

  return {
    color: [...CHART_STATUS_PALETTE],
    grid: { left: 8, right: 8, top: 16, bottom: 28, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: [...categories],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: CHART_COLORS.axis } },
      axisLabel: chartAxisLabel,
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: CHART_COLORS.split } },
      axisLabel: chartMutedAxisLabel,
    },
    series: [
      {
        name: 'Headcount',
        type: 'bar',
        barWidth: '48%',
        data: values.map((value, index) => ({
          value,
          itemStyle: {
            color: CHART_STATUS_PALETTE[index],
            borderRadius: [6, 6, 0, 0],
          },
        })),
      },
    ],
  }
})

const legend = computed(() =>
  categories.map((label, index) => ({
    label,
    value:
      index === 0
        ? props.summary.present_count
        : index === 1
          ? props.summary.late_count
          : index === 2
            ? props.summary.absent_count
            : props.summary.missing_clock_out_count,
    color: CHART_STATUS_PALETTE[index]!,
  })),
)
</script>

<template>
  <AppCard>
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-slate-900">Today's attendance mix</h2>
        <p class="mt-0.5 text-sm text-slate-500">
          {{ summary.present_count }} present of {{ summary.total_records }} records
        </p>
      </div>
      <span class="text-xs text-slate-400">{{ summary.total_records }} records</span>
    </div>

    <AppChart :option="chartOption" :height="192" />

    <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="item in legend"
        :key="item.label"
        class="rounded-lg border border-gray-100 bg-slate-50 p-3"
      >
        <div class="mb-1 flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: item.color }" />
          <p class="text-xs text-slate-500">{{ item.label }}</p>
        </div>
        <p class="text-lg font-semibold text-slate-900">{{ item.value }}</p>
      </div>
    </div>
  </AppCard>
</template>
