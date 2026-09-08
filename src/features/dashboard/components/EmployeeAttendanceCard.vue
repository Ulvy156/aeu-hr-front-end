<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from '@lucide/vue'
import { AppCard } from '@/components/common'
import type { TodayAttendance } from '../types/dashboard'
import { attendanceStatusTone, formatDashboardTime } from '../utils/dashboardDisplay'

const props = defineProps<{
  attendance: TodayAttendance | null
}>()

const tone = computed(() => {
  if (!props.attendance) return null
  return attendanceStatusTone(props.attendance.status, props.attendance.is_late)
})
</script>

<template>
  <AppCard>
    <div class="mb-4 flex items-center gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
      >
        <Clock class="h-5 w-5" />
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-800">Today's attendance</p>
        <p class="text-xs text-slate-400">
          {{
            new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })
          }}
        </p>
      </div>
    </div>

    <div v-if="attendance && tone" class="space-y-3 rounded-lg border p-4" :class="tone.wrap">
      <p class="text-sm font-semibold" :class="tone.text">{{ tone.label }}</p>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p class="mb-0.5 text-xs text-slate-500">Clock in</p>
          <p class="font-semibold text-slate-800">
            {{ formatDashboardTime(attendance.clock_in_time) }}
          </p>
        </div>
        <div>
          <p class="mb-0.5 text-xs text-slate-500">Clock out</p>
          <p
            class="font-semibold"
            :class="attendance.clock_out_time ? 'text-slate-800' : 'text-slate-400'"
          >
            {{
              attendance.clock_out_time
                ? formatDashboardTime(attendance.clock_out_time)
                : 'Not yet'
            }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-8 text-center">
      <Clock class="mb-3 h-10 w-10 text-slate-200" />
      <p class="text-sm font-medium text-slate-600">No attendance today</p>
      <p class="mt-1 text-xs text-slate-400">You haven't clocked in yet today.</p>
    </div>
  </AppCard>
</template>
