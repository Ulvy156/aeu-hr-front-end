<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchTeamAttendanceSummary } from '../services/attendance.api'
import type { TeamAttendanceSummary } from '../types/attendance'

const props = defineProps<{
  dateFrom: string
  dateTo: string
  employeeName: string
  departmentId: number | null
}>()

const summary = ref<TeamAttendanceSummary | null>(null)
const loading = ref(false)
const error = ref(false)

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

async function load() {
  loading.value = true
  error.value = false
  try {
    const params: {
      date_from?: string
      date_to?: string
      employee_name?: string
      department_id?: number
    } = {}
    if (props.dateFrom) params.date_from = props.dateFrom
    if (props.dateTo) params.date_to = props.dateTo
    if (props.employeeName) params.employee_name = props.employeeName
    if (props.departmentId !== null) params.department_id = props.departmentId

    const response = await fetchTeamAttendanceSummary(params)
    summary.value = response.data
  } catch {
    error.value = true
    summary.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.dateFrom, props.dateTo, props.employeeName, props.departmentId] as const,
  () => {
    void load()
  },
  { immediate: true },
)

defineExpose({ load })
</script>

<template>
  <section class="space-y-3">
    <div>
      <h2 class="text-sm font-semibold text-slate-800">Team attendance</h2>
      <p class="text-xs text-slate-500">{{ periodLabel }}</p>
    </div>

    <div v-if="error" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
      Failed to load team attendance summary.
    </div>
    <div v-else-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div v-for="index in 5" :key="index" class="h-24 animate-pulse rounded-xl bg-slate-100" />
    </div>
    <div v-else-if="summary" class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p class="text-xs font-medium uppercase text-emerald-700">Present</p>
        <p class="mt-1 text-2xl font-bold text-emerald-700">{{ summary.summary.present }}</p>
        <p class="text-xs text-emerald-600">recorded days</p>
      </div>
      <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p class="text-xs font-medium uppercase text-amber-700">Late</p>
        <p class="mt-1 text-2xl font-bold text-amber-700">{{ summary.summary.late }}</p>
        <p class="text-xs text-amber-600">recorded days</p>
      </div>
      <div class="rounded-xl border border-red-100 bg-red-50 p-4">
        <p class="text-xs font-medium uppercase text-red-700">Absent</p>
        <p class="mt-1 text-2xl font-bold text-red-700">{{ summary.summary.absent }}</p>
        <p class="text-xs text-red-600">completed workdays</p>
      </div>
      <div class="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p class="text-xs font-medium uppercase text-orange-700">Missing clock in</p>
        <p class="mt-1 text-2xl font-bold text-orange-700">{{ summary.summary.missing_clock_in }}</p>
        <p class="text-xs text-orange-600">recorded days</p>
      </div>
      <div class="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p class="text-xs font-medium uppercase text-orange-700">Missing clock-out</p>
        <p class="mt-1 text-2xl font-bold text-orange-700">{{ summary.summary.missing_clock_out }}</p>
        <p class="text-xs text-orange-600">recorded days</p>
      </div>
    </div>
  </section>
</template>
