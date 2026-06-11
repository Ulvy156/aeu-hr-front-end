<script setup lang="ts">
import type { Employee } from '../types/employee'
import { StatusBadge } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'

defineProps<{
  visible: boolean
  employee: Employee | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { can } = usePermission()

function formatDate(val: string | null): string {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function empStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'active') return 'success'
  if (status === 'resigned') return 'warning'
  if (status === 'terminated') return 'danger'
  return 'info'
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="Employee Detail"
    direction="rtl"
    size="500px"
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-if="employee" class="space-y-5 text-sm">
      <!-- Avatar + name -->
      <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <img
          v-if="employee.profile_photo_url"
          :src="employee.profile_photo_url"
          class="w-14 h-14 rounded-full object-cover shrink-0"
        />
        <div
          v-else
          class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"
        >
          <span class="text-xl font-bold text-emerald-700">
            {{ employee.full_name.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <p class="text-base font-semibold text-slate-900">{{ employee.full_name }}</p>
          <p class="text-sm text-slate-500">{{ employee.employee_id }}</p>
          <el-tag :type="empStatusType(employee.employment_status)" size="small" round class="mt-1">
            {{ employee.employment_status }}
          </el-tag>
        </div>
      </div>

      <!-- Basic Info -->
      <div class="p-4 bg-gray-50 rounded-xl space-y-2.5">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Basic Info</p>
        <div class="flex justify-between"><span class="text-slate-500">Email</span><span class="text-slate-800">{{ employee.user?.email ?? '—' }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Phone</span><span class="text-slate-800">{{ employee.phone_number ?? '—' }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Gender</span><span class="text-slate-800 capitalize">{{ employee.gender ?? '—' }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Date of Birth</span><span class="text-slate-800">{{ formatDate(employee.date_of_birth) }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Address</span><span class="text-slate-800 text-right max-w-[260px]">{{ employee.address ?? '—' }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Emergency Contact</span><span class="text-slate-800">{{ employee.emergency_contact ?? '—' }}</span></div>
      </div>

      <!-- Employment -->
      <div class="p-4 bg-gray-50 rounded-xl space-y-2.5">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Employment</p>
        <div class="flex justify-between"><span class="text-slate-500">Department</span><span class="text-slate-800">{{ employee.department?.name ?? '—' }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Position</span><span class="text-slate-800">{{ employee.position?.name ?? '—' }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Join Date</span><span class="text-slate-800">{{ formatDate(employee.join_date) }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Last Working Date</span><span class="text-slate-800">{{ formatDate(employee.last_working_date) }}</span></div>
        <div v-if="can('employees.update_salary')" class="flex justify-between">
          <span class="text-slate-500">Base Salary</span>
          <span class="font-semibold text-slate-800">${{ employee.base_salary }}</span>
        </div>
      </div>

      <!-- Linked User -->
      <div v-if="employee.user" class="p-4 bg-gray-50 rounded-xl space-y-2.5">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Linked Account</p>
        <div class="flex justify-between"><span class="text-slate-500">Username</span><span class="text-slate-800">{{ employee.user.name }}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Account Status</span><StatusBadge :status="employee.user.status" /></div>
        <div class="flex justify-between">
          <span class="text-slate-500">Roles</span>
          <div class="flex gap-1 flex-wrap justify-end">
            <el-tag v-for="r in employee.user.roles" :key="r" size="small" type="primary" effect="plain">{{ r }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
