<script setup lang="ts">
import { AppCard, StatusBadge } from '@/components/common'
import { formatJobLevel } from '@/features/positions/types/job-level'
import type { ProfileUser } from '../types/profile'
import { formatProfileDate, profileValue } from '../utils/profileDisplay'

defineProps<{
  profile: ProfileUser
}>()
</script>

<template>
  <AppCard no-padding>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold text-slate-900">Employee information</h2>
        <span
          v-if="profile.employee"
          class="font-mono text-xs text-slate-400"
        >
          {{ profile.employee.employee_id }}
        </span>
      </div>
    </template>

    <div v-if="!profile.employee" class="space-y-2">
      <span
        class="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600"
      >
        No employee linked
      </span>
      <p class="text-sm font-semibold text-slate-900">No employee profile linked</p>
      <p class="text-sm text-slate-500">
        This account has no linked employee record. Admin and some HR accounts can look like
        this. Contact HR if that is unexpected.
      </p>
    </div>

    <div v-else class="space-y-5">
      <section class="space-y-3.5">
        <div class="flex items-center gap-2">
          <span class="h-3.5 w-0.5 rounded-sm bg-emerald-600" aria-hidden="true" />
          <h3 class="text-sm font-semibold text-slate-900">Personal</h3>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs font-medium text-slate-400">Employee ID</p>
            <p class="mt-1 font-mono text-sm font-medium text-slate-900">
              {{ profileValue(profile.employee.employee_id) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Full name</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ profileValue(profile.employee.full_name) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Gender</p>
            <p class="mt-1 text-sm font-medium capitalize text-slate-900">
              {{ profileValue(profile.employee.gender) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Date of birth</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ formatProfileDate(profile.employee.date_of_birth) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Phone</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ profileValue(profile.employee.phone_number) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Work email</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ profileValue(profile.employee.email) }}
            </p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-xs font-medium text-slate-400">Address</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ profileValue(profile.employee.address) }}
            </p>
          </div>
        </div>
      </section>

      <div class="border-t border-gray-100" />

      <section class="space-y-3.5">
        <div class="flex items-center gap-2">
          <span class="h-3.5 w-0.5 rounded-sm bg-emerald-600" aria-hidden="true" />
          <h3 class="text-sm font-semibold text-slate-900">Employment</h3>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs font-medium text-slate-400">Department</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ profile.employee.department?.name ?? '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Position</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ profile.employee.position?.name ?? '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Job level</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ formatJobLevel(profile.job_level) || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Employment status</p>
            <div class="mt-1">
              <StatusBadge
                v-if="profile.employee.employment_status"
                :status="profile.employee.employment_status"
              />
              <span v-else class="text-sm text-slate-400">—</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Join date</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ formatProfileDate(profile.employee.join_date) }}
            </p>
          </div>
          <div v-if="profile.employee.employment_status === 'probation'">
            <p class="text-xs font-medium text-slate-400">Probation end</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ formatProfileDate(profile.employee.probation_end_date) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400">Last working date</p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ formatProfileDate(profile.employee.last_working_date) }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </AppCard>
</template>
