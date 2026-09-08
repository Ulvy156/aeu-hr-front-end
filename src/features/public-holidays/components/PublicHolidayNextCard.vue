<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, BaseButton } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import type { PublicHoliday } from '../types/public-holiday'
import {
  formatHolidayDate,
  holidayCountdownLabel,
  holidayRelativeLabel,
  holidayWeekday,
} from '../utils/holidayDisplay'

const props = defineProps<{
  holiday: PublicHoliday
}>()

const emit = defineEmits<{
  edit: [holiday: PublicHoliday]
  disable: [holiday: PublicHoliday]
}>()

const { can } = usePermission()

const subtitle = computed(() => {
  const parts = [
    formatHolidayDate(props.holiday.holiday_date),
    holidayWeekday(props.holiday.holiday_date),
  ]
  if (props.holiday.description) parts.push(props.holiday.description)
  return parts.join(' · ')
})
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Next holiday</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">{{ holiday.name }}</h2>
      </div>
      <span class="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        {{ holidayRelativeLabel(holiday.holiday_date) }}
      </span>
    </div>

    <p class="mt-2 text-sm text-slate-500">{{ subtitle }}</p>

    <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div class="space-y-3">
        <p class="text-sm text-slate-500">
          Used by attendance and payroll once the holiday date is reached. Edit if the official
          calendar shifts.
        </p>
        <div class="flex flex-wrap gap-2">
          <BaseButton
            v-if="can('public_holidays.update')"
            type="primary"
            class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
            @click="emit('edit', holiday)"
          >
            Edit
          </BaseButton>
          <BaseButton
            v-if="can('public_holidays.delete') && holiday.status === 'active'"
            type="danger"
            plain
            @click="emit('disable', holiday)"
          >
            Disable
          </BaseButton>
        </div>
      </div>

      <div class="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3">
        <p class="text-2xl font-semibold text-slate-900">
          {{ holidayCountdownLabel(holiday.holiday_date) }}
        </p>
        <p class="mt-0.5 text-sm text-slate-500">Until holiday</p>
        <p class="mt-2 text-xs text-slate-400">
          Countdown is display-only from the holiday date.
        </p>
      </div>
    </div>
  </AppCard>
</template>
