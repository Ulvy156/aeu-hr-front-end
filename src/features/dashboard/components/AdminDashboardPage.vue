<script setup lang="ts">
import { onMounted } from 'vue'
import { Settings } from '@lucide/vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useDashboard } from '@/composables/useDashboard'
import { getAdminDashboard } from '../services/dashboard.api'
import type { AdminDashboardData } from '../types/dashboard'
import AdminUserSummaryCards from './AdminUserSummaryCards.vue'
import AdminUsersByRole from './AdminUsersByRole.vue'
import AdminSettingsSummary from './AdminSettingsSummary.vue'

const auth = useAuthStore()
const { data, loading, error, load } = useDashboard<AdminDashboardData>(getAdminDashboard)

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
          <Settings class="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p class="mt-0.5 text-sm text-slate-500">
            Welcome back,
            <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>. System overview
            and configuration summary.
          </p>
        </div>
      </div>
      <span
        v-if="data"
        class="shrink-0 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
      >
        {{ data.user_summary.active_users }} active
      </span>
    </div>

    <div v-if="loading" class="space-y-5">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          v-for="i in 3"
          :key="i"
          class="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
        />
      </div>
      <div class="grid gap-5 lg:grid-cols-2">
        <div class="h-56 animate-pulse rounded-xl bg-gray-100" />
        <div class="h-56 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
      <button class="ml-3 text-red-600 underline" @click="load">Retry</button>
    </div>

    <template v-else-if="data">
      <AdminUserSummaryCards :summary="data.user_summary" />

      <div class="grid items-start gap-5 lg:grid-cols-2">
        <AdminUsersByRole
          :users-by-role="data.user_summary.users_by_role"
          :total-users="data.user_summary.total_users"
        />
        <AdminSettingsSummary :settings="data.system_settings_summary" />
      </div>
    </template>
  </div>
</template>
