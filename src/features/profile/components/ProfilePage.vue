<script setup lang="ts">
import { onMounted } from 'vue'
import { User } from '@lucide/vue'
import { AppCard, StatusBadge, EmptyState } from '@/components/common'
import { useProfile } from '../composables/useProfile'

const { profile, loading, fetchProfile } = useProfile()

onMounted(fetchProfile)

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function val(v: string | null | undefined): string {
  return v?.trim() || '—'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center gap-3">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <User class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">My Profile</h1>
        <p class="mt-0.5 text-sm text-slate-500">View your account and employee profile information.</p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <el-skeleton :rows="4" animated />
      </div>
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <el-skeleton :rows="6" animated />
      </div>
    </div>

    <template v-else-if="profile">
      <!-- A. Account Information -->
      <AppCard>
        <template #header>
          <h2 class="text-base font-semibold text-slate-900">Account Information</h2>
          <p class="text-sm text-slate-500 mt-0.5">Your login account details and assigned roles.</p>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Name</p>
            <p class="text-sm text-slate-800">{{ val(profile.name) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Email</p>
            <p class="text-sm text-slate-800">{{ val(profile.email) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Account Status</p>
            <StatusBadge :status="profile.status" />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Permissions</p>
            <p class="text-sm text-slate-800">{{ profile.permissions.length }} permission(s) assigned</p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Roles</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in profile.roles"
                :key="role"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                {{ role }}
              </span>
              <span v-if="!profile.roles.length" class="text-sm text-slate-400">No roles assigned</span>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- B. Employee Information -->
      <AppCard>
        <template #header>
          <h2 class="text-base font-semibold text-slate-900">Employee Information</h2>
          <p class="text-sm text-slate-500 mt-0.5">Your employment details and linked employee profile.</p>
        </template>

        <!-- No employee linked -->
        <EmptyState
          v-if="!profile.employee"
          title="No employee profile linked."
          description="No employee profile is linked to this account."
        />

        <!-- Employee data -->
        <template v-else>
          <!-- Profile photo -->
          <div v-if="profile.employee.profile_photo_url" class="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
            <img
              :src="profile.employee.profile_photo_url"
              :alt="profile.employee.full_name"
              class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <p class="text-base font-semibold text-slate-900">{{ profile.employee.full_name }}</p>
              <p class="text-sm text-slate-400">{{ profile.employee.employee_id }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Employee ID</p>
              <p class="text-sm font-mono text-slate-800">{{ val(profile.employee.employee_id) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
              <p class="text-sm text-slate-800">{{ val(profile.employee.full_name) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Gender</p>
              <p class="text-sm text-slate-800 capitalize">{{ val(profile.employee.gender) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Date of Birth</p>
              <p class="text-sm text-slate-800">{{ fmtDate(profile.employee.date_of_birth) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Phone Number</p>
              <p class="text-sm text-slate-800">{{ val(profile.employee.phone_number) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Employee Email</p>
              <p class="text-sm text-slate-800">{{ val(profile.employee.email) }}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Address</p>
              <p class="text-sm text-slate-800">{{ val(profile.employee.address) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Department</p>
              <p class="text-sm text-slate-800">{{ profile.employee.department?.name ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Position</p>
              <p class="text-sm text-slate-800">{{ profile.employee.position?.name ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Join Date</p>
              <p class="text-sm text-slate-800">{{ fmtDate(profile.employee.join_date) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Last Working Date</p>
              <p class="text-sm text-slate-800">{{ fmtDate(profile.employee.last_working_date) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Employment Status</p>
              <StatusBadge
                v-if="profile.employee.employment_status"
                :status="profile.employee.employment_status"
              />
              <span v-else class="text-sm text-slate-400">—</span>
            </div>
          </div>
        </template>
      </AppCard>
    </template>
  </div>
</template>
