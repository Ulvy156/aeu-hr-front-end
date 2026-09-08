<script setup lang="ts">
import { computed } from 'vue'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, PieSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
} from 'echarts/components'
import { VChart } from '@/lib/echarts'

type AppChartOption = ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
>

const props = withDefaults(
  defineProps<{
    option: AppChartOption
    height?: number | string
  }>(),
  {
    height: 192,
  },
)

const containerStyle = computed(() => ({
  width: '100%',
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
</script>

<template>
  <div :style="containerStyle">
    <VChart
      :option="option"
      :autoresize="{ throttle: 0 }"
      style="display: block; width: 100%; height: 100%"
    />
  </div>
</template>
