<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAttendanceSummary } from '../composables/useAttendanceSummary'

const { month, year, summary, loading, error, isCurrentMonth, todayLabel, attendanceRate, load } =
  useAttendanceSummary()

onMounted(load)

watch([month, year], load)

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const monthOptions = MONTH_NAMES.map((label, i) => ({ label, value: i + 1 }))

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => ({
  label: String(y),
  value: y,
}))

const todayBadgeClass: Record<string, string> = {
  'Not clocked in': 'bg-slate-100 text-slate-600',
  'Clocked in': 'bg-emerald-100 text-emerald-700',
  'Completed': 'bg-blue-100 text-blue-700',
  'Late': 'bg-amber-100 text-amber-700',
  'Missing clock-out': 'bg-orange-100 text-orange-700',
}
</script>

<template>
  <div class="space-y-3">
    <!-- Header row: period selector + today badge -->
    <div class="flex flex-wrap items-center gap-2">
      <el-select v-model="month" class="w-36!" size="small">
        <el-option v-for="opt in monthOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <el-select v-model="year" class="w-24!" size="small">
        <el-option v-for="opt in yearOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <span
        v-if="isCurrentMonth && todayLabel"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
        :class="todayBadgeClass[todayLabel] ?? 'bg-slate-100 text-slate-600'"
      >
        <span class="size-1.5 rounded-full bg-current opacity-70" />
        Today: {{ todayLabel }}
      </span>
    </div>

    <!-- Error state -->
    <div
      v-if="error"
      class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {{ error }}
    </div>

    <!-- Skeleton -->
    <div v-else-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="n in 5"
        :key="n"
        class="animate-pulse rounded-xl border border-gray-100 bg-white p-4 space-y-2"
      >
        <div class="h-3 w-20 rounded bg-slate-100" />
        <div class="h-7 w-10 rounded bg-slate-100" />
      </div>
    </div>

    <!-- Cards -->
    <div v-else-if="summary" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <!-- Present -->
      <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p class="text-xs font-medium text-emerald-700 uppercase tracking-wide">Present</p>
        <p class="mt-1 text-2xl font-bold text-emerald-700">{{ summary.summary.present }}</p>
        <p class="mt-0.5 text-xs text-emerald-600">days</p>
      </div>

      <!-- Late -->
      <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p class="text-xs font-medium text-amber-700 uppercase tracking-wide">Late</p>
        <p class="mt-1 text-2xl font-bold text-amber-700">{{ summary.summary.late }}</p>
        <p class="mt-0.5 text-xs text-amber-600">days</p>
      </div>

      <!-- Absent -->
      <div class="rounded-xl border border-red-100 bg-red-50 p-4">
        <p class="text-xs font-medium text-red-700 uppercase tracking-wide">Absent</p>
        <p class="mt-1 text-2xl font-bold text-red-700">{{ summary.summary.absent }}</p>
        <p class="mt-0.5 text-xs text-red-600">days</p>
      </div>

      <!-- Missing Clock-Out -->
      <div class="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p class="text-xs font-medium text-orange-700 uppercase tracking-wide">Missing Clock-Out</p>
        <p class="mt-1 text-2xl font-bold text-orange-700">{{ summary.summary.missing_clock_out }}</p>
        <p class="mt-0.5 text-xs text-orange-600">days</p>
      </div>

      <!-- Attendance Rate -->
      <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p class="text-xs font-medium text-blue-700 uppercase tracking-wide">Attendance Rate</p>
        <p class="mt-1 text-2xl font-bold text-blue-700">{{ attendanceRate }}</p>
        <p class="mt-0.5 text-xs text-blue-600">
          {{ summary.summary.attended_days }} / {{ summary.summary.working_days_in_period }} days
        </p>
      </div>
    </div>
  </div>
</template>
