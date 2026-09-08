<script setup lang="ts">
import { BriefcaseBusiness, CircleCheck, Users, CalendarClock } from '@lucide/vue'
import type { VacancySummary } from '../types/vacancy'

defineProps<{
  summary: VacancySummary
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
          <BriefcaseBusiness class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ summary.open_count }}</p>
          <p class="text-sm text-slate-500">Open vacancies</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <CircleCheck class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ summary.closed_count }}</p>
          <p class="text-sm text-slate-500">Closed vacancies</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
        >
          <Users class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">
            {{ summary.open_filled_headcount }}/{{ summary.open_required_headcount }}
          </p>
          <p class="text-sm text-slate-500">Headcount filled (open)</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            summary.overdue_open_count > 0
              ? 'bg-amber-50 text-amber-600'
              : 'bg-slate-100 text-slate-600'
          "
        >
          <CalendarClock class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-2xl font-semibold"
            :class="summary.overdue_open_count > 0 ? 'text-amber-600' : 'text-slate-900'"
          >
            {{ summary.overdue_open_count }}
          </p>
          <p class="text-sm text-slate-500">Past target date</p>
        </div>
      </div>
    </div>
  </div>
</template>
