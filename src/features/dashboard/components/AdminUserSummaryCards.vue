<script setup lang="ts">
import { Users, UserCheck, UserX } from '@lucide/vue'
import type { UserSummary } from '../types/dashboard'

defineProps<{
  summary: UserSummary
  loading?: boolean
}>()
</script>

<template>
  <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div
      v-for="n in 3"
      :key="n"
      class="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
    />
  </div>

  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <Users class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ summary.total_users }}</p>
          <p class="text-sm text-slate-500">Total users</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <UserCheck class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-emerald-600">{{ summary.active_users }}</p>
          <p class="text-sm text-slate-500">Active</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <UserX class="h-5 w-5" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-400">{{ summary.inactive_users }}</p>
          <p class="text-sm text-slate-500">Inactive</p>
        </div>
      </div>
    </div>
  </div>
</template>
