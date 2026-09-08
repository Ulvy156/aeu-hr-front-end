<script setup lang="ts">
import { computed } from 'vue'
import { StatusBadge } from '@/components/common'
import type { ProfileUser } from '../types/profile'
import {
  profileDisplayName,
  profileInitials,
  profileMetaLine,
} from '../utils/profileDisplay'

const props = defineProps<{
  profile: ProfileUser
}>()

const displayName = computed(() => profileDisplayName(props.profile))
const meta = computed(() => profileMetaLine(props.profile))
const photoUrl = computed(() => props.profile.employee?.profile_photo_url ?? null)
const employeeId = computed(() => props.profile.employee?.employee_id ?? null)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <div class="h-2 bg-emerald-600" />
    <div class="p-6">
      <div class="flex items-start gap-5">
        <img
          v-if="photoUrl"
          :src="photoUrl"
          :alt="displayName"
          class="h-[72px] w-[72px] shrink-0 rounded-full border-2 border-emerald-200 object-cover"
        />
        <div
          v-else
          class="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 text-xl font-bold text-emerald-700"
          aria-hidden="true"
        >
          {{ profileInitials(displayName) }}
        </div>

        <div class="min-w-0 flex-1 space-y-2.5">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              My profile
            </p>
            <h1 class="mt-1 text-xl font-semibold text-slate-900">{{ displayName }}</h1>
            <p v-if="employeeId" class="mt-1 text-sm text-slate-500">
              <span class="font-mono text-slate-600">{{ employeeId }}</span>
              <template v-if="meta"> · {{ meta }}</template>
            </p>
            <p v-else class="mt-1 text-sm text-slate-500">{{ meta }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="profile.status" />
            <StatusBadge
              v-if="profile.employee?.employment_status"
              :status="profile.employee.employment_status"
            />
            <span
              v-else
              class="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600"
            >
              No employee linked
            </span>
            <span
              v-for="role in profile.roles"
              :key="role"
              class="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
            >
              {{ role }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
