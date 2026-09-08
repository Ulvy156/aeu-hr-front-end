<script setup lang="ts">
import { computed } from 'vue'
import type { PublicHoliday } from '../types/public-holiday'
import {
  formatHolidayDate,
  holidayRelativeLabel,
  holidayWeekday,
  isSoonHoliday,
} from '../utils/holidayDisplay'

const props = defineProps<{
  holidays: PublicHoliday[]
}>()

const emit = defineEmits<{
  edit: [holiday: PublicHoliday]
  disable: [holiday: PublicHoliday]
}>()

const list = computed(() => props.holidays.slice(0, 5))
</script>

<template>
  <div v-if="list.length" class="border-t border-gray-100 p-5 lg:border-t-0 lg:border-l">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-slate-900">Coming up</h2>
      <span class="text-xs text-slate-400">{{ list.length }} next</span>
    </div>

    <div class="space-y-4">
      <div
        v-for="(row, index) in list"
        :key="row.id"
        class="space-y-1.5"
        :class="index > 0 ? 'border-t border-gray-100 pt-4' : ''"
      >
        <p class="truncate text-sm font-medium text-slate-900">{{ row.name }}</p>
        <p class="text-xs text-slate-500">
          {{ formatHolidayDate(row.holiday_date) }} · {{ holidayWeekday(row.holiday_date) }}
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-md px-2 py-0.5 text-xs font-medium"
            :class="
              isSoonHoliday(row)
                ? 'bg-blue-50 text-blue-700'
                : 'bg-slate-100 text-slate-600'
            "
          >
            {{ holidayRelativeLabel(row.holiday_date) }}
          </span>
          <button
            type="button"
            class="text-xs text-slate-400 transition-colors hover:text-emerald-700"
            @click="emit('edit', row)"
          >
            Edit
          </button>
          <button
            v-if="row.status === 'active'"
            type="button"
            class="text-xs text-slate-400 transition-colors hover:text-red-600"
            @click="emit('disable', row)"
          >
            Disable
          </button>
        </div>
      </div>
    </div>

    <p class="mt-4 text-xs text-slate-400">Next 90 days from today. Active holidays only.</p>
  </div>
</template>
