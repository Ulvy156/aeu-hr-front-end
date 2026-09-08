<script setup lang="ts">
import { Clock, MapPin, Settings } from '@lucide/vue'
import { AppCard } from '@/components/common'
import type { SystemSettingsSummary } from '../types/dashboard'
import {
  formatWorkingDaysSummary,
  formatWorkingTime,
} from '../utils/dashboardDisplay'

defineProps<{
  settings: SystemSettingsSummary
}>()
</script>

<template>
  <AppCard>
    <div class="mb-4 flex items-center gap-2">
      <Settings class="h-4 w-4 text-slate-400" />
      <div>
        <h2 class="text-base font-semibold text-slate-900">System settings summary</h2>
        <p class="text-xs text-slate-400">Configuration overview from company settings.</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 text-sm">
      <div class="rounded-lg border border-gray-100 bg-slate-50 p-3">
        <p class="mb-1 text-xs text-slate-400">Company</p>
        <p class="font-semibold text-slate-800">{{ settings.company_name }}</p>
      </div>
      <div class="rounded-lg border border-gray-100 bg-slate-50 p-3">
        <p class="mb-1 text-xs text-slate-400">Currency</p>
        <p class="font-semibold text-slate-800">{{ settings.salary_currency }}</p>
      </div>
      <div class="rounded-lg border border-gray-100 bg-slate-50 p-3">
        <p class="mb-1 text-xs text-slate-400">Payroll day rate</p>
        <p class="font-semibold text-slate-800">{{ settings.payroll_day_rate }} days/month</p>
      </div>
      <div class="rounded-lg border border-gray-100 bg-slate-50 p-3">
        <div class="mb-1 flex items-center gap-1">
          <Clock class="h-3 w-3 text-slate-400" />
          <p class="text-xs text-slate-400">Working hours</p>
        </div>
        <p class="font-semibold text-slate-800">
          {{ formatWorkingTime(settings.working_start_time) }} –
          {{ formatWorkingTime(settings.working_end_time) }}
        </p>
      </div>
      <div class="rounded-lg border border-gray-100 bg-slate-50 p-3">
        <p class="mb-1 text-xs text-slate-400">Working days</p>
        <p class="font-semibold text-slate-800">{{ formatWorkingDaysSummary(settings) }}</p>
      </div>
      <div class="rounded-lg border border-gray-100 bg-slate-50 p-3">
        <div class="mb-1 flex items-center gap-1">
          <MapPin class="h-3 w-3 text-slate-400" />
          <p class="text-xs text-slate-400">Office GPS</p>
        </div>
        <p class="font-semibold text-slate-800">{{ settings.allowed_radius_meters }}m radius</p>
        <p
          class="mt-0.5 text-xs"
          :class="
            settings.office_location_configured ? 'text-emerald-600' : 'text-amber-500'
          "
        >
          {{ settings.office_location_configured ? 'Location set' : 'Not configured' }}
        </p>
      </div>
    </div>
  </AppCard>
</template>
