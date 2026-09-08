<script setup lang="ts">
import { AlertCircle, Clock, UserX, List } from '@lucide/vue'
import type { CorrectionQueue, CorrectionQueueCounts } from '../types/attendance'

defineProps<{
  counts: CorrectionQueueCounts
  queue: CorrectionQueue
  loading: boolean
}>()

const emit = defineEmits<{
  select: [queue: CorrectionQueue]
}>()

const cards: {
  key: CorrectionQueue
  label: string
  icon: typeof AlertCircle
  iconClass: string
}[] = [
  {
    key: 'needs_review',
    label: 'Needs review',
    icon: AlertCircle,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'late',
    label: 'Late',
    icon: Clock,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'absent',
    label: 'Absent',
    icon: UserX,
    iconClass: 'bg-red-50 text-red-600',
  },
  {
    key: 'all',
    label: 'All records',
    icon: List,
    iconClass: 'bg-slate-100 text-slate-600',
  },
]
</script>

<template>
  <div v-if="loading" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div
      v-for="n in 4"
      :key="n"
      class="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
    />
  </div>

  <div v-else class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <button
      v-for="card in cards"
      :key="card.key"
      type="button"
      class="rounded-xl border bg-white p-5 text-left transition-colors"
      :class="
        queue === card.key
          ? 'border-emerald-200 ring-1 ring-emerald-100'
          : 'border-gray-200 hover:border-gray-300'
      "
      @click="emit('select', card.key)"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="card.iconClass"
        >
          <component :is="card.icon" class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="
              card.key === 'needs_review' && counts.needs_review > 0
                ? 'text-amber-600'
                : 'text-slate-900'
            "
          >
            {{ counts[card.key] }}
          </p>
          <p class="text-sm text-slate-500">{{ card.label }}</p>
        </div>
      </div>
    </button>
  </div>
</template>
