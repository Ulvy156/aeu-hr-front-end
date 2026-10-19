<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CalendarDays, Users, CalendarCheck, Clock3, Loader2 } from '@lucide/vue'
import { BaseButton } from '@/components/common'
import { fetchMonthlyLeaveSummary } from '../services/leave.api'
import type { MonthlyLeaveSummary } from '../types/leave'

const props = defineProps<{ refreshKey: number }>()
const emit = defineEmits<{
  filter: [status: string, dateFrom: string, dateTo: string]
}>()
const summary = ref<MonthlyLeaveSummary | null>(null)
const loading = ref(false)
const failed = ref(false)
let requestId = 0

const monthLabel = computed(() => {
  const date = summary.value ? new Date(`${summary.value.month}-01T00:00:00`) : new Date()
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})
const cards = computed(() => [
  {
    key: 'on_leave_today' as const,
    label: 'On leave today',
    description: 'Employees on approved leave today.',
    icon: CalendarDays,
    tone: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    status: 'approved',
    today: true,
  },
  {
    key: 'employees_taking_leave' as const,
    label: 'Employees taking leave',
    description: 'Employees with approved leave this month, counted once each.',
    icon: Users,
    tone: 'bg-blue-50 border-blue-100 text-blue-600',
    status: 'approved',
    today: false,
  },
  {
    key: 'total_leave_days' as const,
    label: 'Total leave days',
    description: 'Approved working days off this month, including half-days.',
    icon: CalendarCheck,
    tone: 'bg-purple-50 border-purple-100 text-purple-600',
    status: 'approved',
    today: false,
  },
  {
    key: 'awaiting_approval' as const,
    label: 'Awaiting approval',
    description: 'Requests for leave this month that still need approval.',
    icon: Clock3,
    tone: 'bg-amber-50 border-amber-100 text-amber-600',
    status: 'pending',
    today: false,
  },
])

async function load() {
  const currentRequest = ++requestId
  loading.value = true
  failed.value = false
  try {
    const response = await fetchMonthlyLeaveSummary()
    if (currentRequest === requestId) summary.value = response.data
  } catch {
    if (currentRequest === requestId) failed.value = true
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

function viewRequests(card: (typeof cards.value)[number]) {
  if (!summary.value) return
  emit(
    'filter',
    card.status,
    card.today ? summary.value.today : summary.value.date_from,
    card.today ? summary.value.today : summary.value.date_to,
  )
}

watch(() => props.refreshKey, load, { immediate: true })
</script>

<template>
  <section aria-labelledby="monthly-leave-summary" :aria-busy="loading">
    <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="monthly-leave-summary" class="text-sm font-semibold text-slate-800">
        Leave this month · {{ monthLabel }}
      </h2>
      <span class="text-xs text-slate-500">Across all requests you can view</span>
    </div>
    <div
      v-if="failed"
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-5"
      role="status"
    >
      <p class="text-sm text-slate-500">Monthly leave summary is unavailable.</p>
      <BaseButton @click="load">Retry</BaseButton>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="card in cards"
        :key="card.key"
        type="button"
        class="flex flex-col rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait"
        :disabled="loading || !summary"
        :aria-label="`${card.label}: ${summary?.[card.key] ?? 'loading'}. View matching requests`"
        @click="viewRequests(card)"
      >
        <div
          class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border"
          :class="card.tone"
        >
          <component :is="card.icon" class="h-4 w-4" />
        </div>
        <h3 class="text-xs text-slate-500">{{ card.label }}</h3>
        <div class="my-1 text-2xl font-bold tabular-nums text-slate-900">
          <Loader2
            v-if="loading"
            class="my-1 h-6 w-6 animate-spin text-slate-300"
            aria-label="Loading"
          />
          <template v-else>{{ summary?.[card.key].toLocaleString() }}</template>
        </div>
        <p class="text-xs leading-5 text-slate-400">{{ card.description }}</p>
      </button>
    </div>
  </section>
</template>
