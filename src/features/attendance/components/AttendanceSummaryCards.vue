<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchAttendanceSummary } from '../services/attendance.api'
import type { AttendanceSummary } from '../types/attendance'

const props = defineProps<{
  dateFrom: string
  dateTo: string
}>()

const summary = ref<AttendanceSummary | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const periodLabel = computed(() => {
  if (props.dateFrom && props.dateTo) {
    return props.dateFrom === props.dateTo
      ? `Attendance for ${props.dateFrom}.`
      : `Attendance from ${props.dateFrom} to ${props.dateTo}.`
  }
  if (props.dateFrom) return `Attendance from ${props.dateFrom}.`
  if (props.dateTo) return `Attendance until ${props.dateTo}.`
  return 'Attendance matching current filters.'
})

const periodIncludesToday = computed(() => {
  if (!summary.value) return false
  const today = new Date()
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  const from = summary.value.period.from
  const to = summary.value.period.to
  return todayKey >= from && todayKey <= to
})

const todayLabel = computed((): string | null => {
  if (!periodIncludesToday.value || !summary.value) return null
  const today = summary.value.today
  if (!today) return 'Not clocked in'
  if (today.status === 'present' && today.clock_out_time === null) return 'Clocked in'
  if (today.status === 'present' && today.clock_out_time !== null) return 'Completed'
  if (today.status === 'late') return 'Late'
  if (today.status === 'absent') return 'Absent'
  if (today.status === 'missing_clock_in') return 'Missing clock in'
  if (today.status === 'missing_both') return 'Missing both'
  if (today.status === 'missing_clock_out') return 'Missing clock-out'
  return null
})

const todayBadgeClass: Record<string, string> = {
  'Not clocked in': 'bg-slate-100 text-slate-600',
  'Clocked in': 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-blue-100 text-blue-700',
  Late: 'bg-amber-100 text-amber-700',
  Absent: 'bg-red-100 text-red-700',
  'Missing clock in': 'bg-orange-100 text-orange-700',
  'Missing both': 'bg-orange-100 text-orange-700',
  'Missing clock-out': 'bg-orange-100 text-orange-700',
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const params: { date_from?: string; date_to?: string } = {}
    if (props.dateFrom) params.date_from = props.dateFrom
    if (props.dateTo) params.date_to = props.dateTo

    const res = await fetchAttendanceSummary(params)
    summary.value = res.data
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 403) {
      error.value = 'No employee profile linked to this account.'
    } else {
      error.value = 'Failed to load attendance summary.'
    }
    summary.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.dateFrom, props.dateTo] as const,
  () => {
    void load()
  },
  { immediate: true },
)

defineExpose({ load })
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">My attendance</h2>
        <p class="text-xs text-slate-500">{{ periodLabel }}</p>
      </div>
      <span
        v-if="todayLabel"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
        :class="todayBadgeClass[todayLabel] ?? 'bg-slate-100 text-slate-600'"
      >
        <span class="size-1.5 rounded-full bg-current opacity-70" />
        Today: {{ todayLabel }}
      </span>
    </div>

    <div
      v-if="error"
      class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {{ error }}
    </div>

    <div v-else-if="loading" class="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <div
        v-for="n in 5"
        :key="n"
        class="animate-pulse rounded-xl border border-gray-100 bg-white p-4 space-y-2"
      >
        <div class="h-3 w-20 rounded bg-slate-100" />
        <div class="h-7 w-10 rounded bg-slate-100" />
      </div>
    </div>

    <div v-else-if="summary" class="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p class="text-xs font-medium text-emerald-700 uppercase tracking-wide">Present</p>
        <p class="mt-1 text-2xl font-bold text-emerald-700">{{ summary.summary.present }}</p>
        <p class="mt-0.5 text-xs text-emerald-600">days</p>
      </div>

      <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p class="text-xs font-medium text-amber-700 uppercase tracking-wide">Late</p>
        <p class="mt-1 text-2xl font-bold text-amber-700">{{ summary.summary.late }}</p>
        <p class="mt-0.5 text-xs text-amber-600">days</p>
      </div>

      <div class="rounded-xl border border-red-100 bg-red-50 p-4">
        <p class="text-xs font-medium text-red-700 uppercase tracking-wide">Absent</p>
        <p class="mt-1 text-2xl font-bold text-red-700">{{ summary.summary.absent }}</p>
        <p class="mt-0.5 text-xs text-red-600">completed workdays</p>
      </div>

      <div class="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p class="text-xs font-medium text-orange-700 uppercase tracking-wide">Missing clock in</p>
        <p class="mt-1 text-2xl font-bold text-orange-700">{{ summary.summary.missing_clock_in }}</p>
        <p class="mt-0.5 text-xs text-orange-600">days</p>
      </div>
      <div class="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p class="text-xs font-medium text-orange-700 uppercase tracking-wide">Missing Clock-Out</p>
        <p class="mt-1 text-2xl font-bold text-orange-700">{{ summary.summary.missing_clock_out }}</p>
        <p class="mt-0.5 text-xs text-orange-600">days</p>
      </div>
    </div>
  </div>
</template>
