<script setup lang="ts">
import { computed } from 'vue'
import { hiringFillPercent } from '../utils/vacancyDisplay'

const props = defineProps<{
  filled: number
  required: number
  leftLabel?: string
  rightLabel?: string
}>()

const remaining = computed(() => Math.max(0, props.required - props.filled))
const percent = computed(() => hiringFillPercent(props.filled, props.required))
</script>

<template>
  <div class="min-w-[140px]">
    <div class="mb-1 flex justify-between gap-2 text-xs text-slate-500">
      <span>{{ leftLabel ?? `${filled} of ${required} hired` }}</span>
      <span>{{ rightLabel ?? `${remaining} open` }}</span>
    </div>
    <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
      <div class="h-full rounded-full bg-emerald-600" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>
