<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { fetchTeamAttendanceSummary } from '../services/attendance.api'
import type { TeamAttendanceSummary } from '../types/attendance'

const now = new Date()
const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())
const summary = ref<TeamAttendanceSummary | null>(null)
const loading = ref(false)
const error = ref(false)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const monthOptions = monthNames.map((label, index) => ({ label, value: index + 1 }))
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index)

async function load() {
  loading.value = true
  error.value = false
  try {
    const response = await fetchTeamAttendanceSummary({ month: month.value, year: year.value })
    summary.value = response.data
  } catch {
    error.value = true
    summary.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch([month, year], load)
defineExpose({ load })
</script>

<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">Team attendance</h2>
        <p class="text-xs text-slate-500">Attendance days across employees this month.</p>
      </div>
      <div class="flex gap-2">
        <el-select v-model="month" class="w-36!" size="small">
          <el-option v-for="option in monthOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-select v-model="year" class="w-24!" size="small">
          <el-option v-for="option in yearOptions" :key="option" :label="String(option)" :value="option" />
        </el-select>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
      Failed to load team attendance summary.
    </div>
    <div v-else-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="index in 4" :key="index" class="h-24 animate-pulse rounded-xl bg-slate-100" />
    </div>
    <div v-else-if="summary" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <p class="text-xs font-medium uppercase text-orange-700">Missing clock-out</p>
        <p class="mt-1 text-2xl font-bold text-orange-700">{{ summary.summary.missing_clock_out }}</p>
        <p class="text-xs text-orange-600">recorded days</p>
      </div>
    </div>
  </section>
</template>
