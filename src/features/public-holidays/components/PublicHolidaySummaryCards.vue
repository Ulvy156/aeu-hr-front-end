<script setup lang="ts">
import { CalendarDays, CalendarCheck, CalendarClock, Calendar } from '@lucide/vue'
import type { HolidayStatusCounts } from '../types/public-holiday'

defineProps<{
  counts: HolidayStatusCounts
  yearLabel: string
  loading: boolean
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
          <CalendarDays class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ counts.all }}</p>
          <p class="text-sm text-slate-500">{{ yearLabel }}</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600"
        >
          <CalendarCheck class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ counts.active }}</p>
          <p class="text-sm text-slate-500">Active</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            counts.within_30_days > 0
              ? 'bg-blue-50 text-blue-600'
              : 'bg-slate-100 text-slate-600'
          "
        >
          <CalendarClock class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="counts.within_30_days > 0 ? 'text-blue-600' : 'text-slate-900'"
          >
            {{ counts.within_30_days }}
          </p>
          <p class="text-sm text-slate-500">Within 30 days</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <Calendar class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ counts.inactive }}</p>
          <p class="text-sm text-slate-500">Inactive</p>
        </div>
      </div>
    </div>
  </div>
</template>
