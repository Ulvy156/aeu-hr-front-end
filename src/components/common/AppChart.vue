<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsCoreOption } from 'echarts/core'
import { VChart } from '@/lib/echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsCoreOption
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
