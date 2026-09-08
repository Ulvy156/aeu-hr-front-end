<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, StatusBadge } from '@/components/common'
import type { ProfileUser } from '../types/profile'
import { profilePermissionCountLabel, profileValue } from '../utils/profileDisplay'

const props = defineProps<{
  profile: ProfileUser
}>()

const permLabel = computed(
  () => `${profilePermissionCountLabel(props.profile.permissions)} perms`,
)
</script>

<template>
  <AppCard no-padding>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold text-slate-900">Account</h2>
        <span
          class="inline-flex items-center rounded-md border border-gray-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600"
        >
          {{ permLabel }}
        </span>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <p class="text-xs font-medium text-slate-400">Login name</p>
        <p class="mt-1 text-sm font-medium text-slate-900">{{ profileValue(profile.name) }}</p>
      </div>
      <div>
        <p class="text-xs font-medium text-slate-400">Login email</p>
        <p class="mt-1 text-sm font-medium text-slate-900">{{ profileValue(profile.email) }}</p>
      </div>
      <div>
        <p class="text-xs font-medium text-slate-400">Account status</p>
        <div class="mt-1">
          <StatusBadge :status="profile.status" />
        </div>
      </div>
      <div>
        <p class="mb-2 text-xs font-medium text-slate-400">Roles</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="role in profile.roles"
            :key="role"
            class="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
          >
            {{ role }}
          </span>
          <span v-if="!profile.roles.length" class="text-sm text-slate-400">
            No roles assigned
          </span>
        </div>
      </div>
    </div>
  </AppCard>
</template>
