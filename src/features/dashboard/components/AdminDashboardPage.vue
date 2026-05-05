<script setup lang="ts">
import { onMounted } from 'vue'
import { Settings, Users, UserCheck, UserX, Shield, Clock, MapPin } from '@lucide/vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useDashboard } from '@/composables/useDashboard'
import { getAdminDashboard } from '../services/dashboard.api'
import type { AdminDashboardData } from '../types/dashboard'

const auth = useAuthStore()
const { data, loading, error, load } = useDashboard<AdminDashboardData>(getAdminDashboard)

onMounted(load)

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatTime(t: string): string {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h ?? '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${((hour % 12) || 12).toString().padStart(2, '0')}:${m} ${ampm}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start gap-3">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <Settings class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Welcome back, <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>.
          System overview and user management summary.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i" class="h-28 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
      <button class="ml-3 underline text-red-600" @click="load">Retry</button>
    </div>

    <template v-else-if="data">
      <!-- User summary top cards -->
      <div>
        <h2 class="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <Users class="w-4 h-4" /> User Summary
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users class="w-5 h-5 text-emerald-600" />
              </div>
              <p class="text-sm text-slate-500">Total Users</p>
            </div>
            <p class="text-3xl font-bold text-slate-900">{{ data.user_summary.total_users }}</p>
          </div>

          <div class="bg-white border border-emerald-100 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <UserCheck class="w-5 h-5 text-emerald-600" />
              </div>
              <p class="text-sm text-slate-500">Active</p>
            </div>
            <p class="text-3xl font-bold text-emerald-600">{{ data.user_summary.active_users }}</p>
          </div>

          <div class="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center">
                <UserX class="w-5 h-5 text-slate-400" />
              </div>
              <p class="text-sm text-slate-500">Inactive</p>
            </div>
            <p class="text-3xl font-bold text-slate-400">{{ data.user_summary.inactive_users }}</p>
          </div>
        </div>
      </div>

      <!-- Users by role -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-2 mb-4">
          <Shield class="w-4 h-4 text-slate-400" />
          <h2 class="text-sm font-semibold text-slate-800">Users by Role</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="(count, role) in data.user_summary.users_by_role"
            :key="role"
            class="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center"
          >
            <p class="text-2xl font-bold text-slate-800">{{ count }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ formatRole(String(role)) }}</p>
          </div>
        </div>
      </div>

      <!-- System settings summary -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-2 mb-4">
          <Settings class="w-4 h-4 text-slate-400" />
          <div>
            <h2 class="text-sm font-semibold text-slate-800">System Settings Summary</h2>
            <p class="text-xs text-slate-400">Safe configuration overview from backend.</p>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p class="text-xs text-slate-400 mb-1">Company</p>
            <p class="font-semibold text-slate-800">{{ data.system_settings_summary.company_name }}</p>
          </div>

          <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p class="text-xs text-slate-400 mb-1">Currency</p>
            <p class="font-semibold text-slate-800">{{ data.system_settings_summary.salary_currency }}</p>
          </div>

          <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p class="text-xs text-slate-400 mb-1">Payroll Day Rate</p>
            <p class="font-semibold text-slate-800">{{ data.system_settings_summary.payroll_day_rate }} days/month</p>
          </div>

          <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div class="flex items-center gap-1 mb-1">
              <Clock class="w-3 h-3 text-slate-400" />
              <p class="text-xs text-slate-400">Working Hours</p>
            </div>
            <p class="font-semibold text-slate-800">
              {{ formatTime(data.system_settings_summary.working_start_time) }} –
              {{ formatTime(data.system_settings_summary.working_end_time) }}
            </p>
          </div>

          <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p class="text-xs text-slate-400 mb-1">Working Days</p>
            <p class="font-semibold text-slate-800">{{ data.system_settings_summary.working_days_count }} days/week</p>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ data.system_settings_summary.working_days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ') }}
            </p>
          </div>

          <div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div class="flex items-center gap-1 mb-1">
              <MapPin class="w-3 h-3 text-slate-400" />
              <p class="text-xs text-slate-400">Office GPS</p>
            </div>
            <p class="font-semibold text-slate-800">
              {{ data.system_settings_summary.allowed_radius_meters }}m radius
            </p>
            <p
              class="text-xs mt-0.5"
              :class="data.system_settings_summary.office_location_configured ? 'text-emerald-600' : 'text-amber-500'"
            >
              {{ data.system_settings_summary.office_location_configured ? 'Location set' : 'Not configured' }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
