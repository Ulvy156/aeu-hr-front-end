<script setup lang="ts">
import { UserCheck, Clock, UserX, LogOut } from '@lucide/vue'
import type { AttendanceSummary } from '../types/dashboard'

defineProps<{
  summary: AttendanceSummary
  loading?: boolean
}>()
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
    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <UserCheck class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-emerald-600">{{ summary.present_count }}</p>
          <p class="text-sm text-slate-500">Present today</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            summary.late_count > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
          "
        >
          <Clock class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="summary.late_count > 0 ? 'text-amber-600' : 'text-slate-900'"
          >
            {{ summary.late_count }}
          </p>
          <p class="text-sm text-slate-500">Late</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            summary.absent_count > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
          "
        >
          <UserX class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="summary.absent_count > 0 ? 'text-red-600' : 'text-slate-900'"
          >
            {{ summary.absent_count }}
          </p>
          <p class="text-sm text-slate-500">Absent</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            summary.missing_clock_out_count > 0
              ? 'bg-blue-50 text-blue-600'
              : 'bg-slate-100 text-slate-600'
          "
        >
          <LogOut class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="
              summary.missing_clock_out_count > 0 ? 'text-blue-600' : 'text-slate-900'
            "
          >
            {{ summary.missing_clock_out_count }}
          </p>
          <p class="text-sm text-slate-500">Missing clock-out</p>
        </div>
      </div>
    </div>
  </div>
</template>
