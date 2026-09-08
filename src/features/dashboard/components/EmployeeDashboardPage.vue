<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermission } from '@/composables/usePermissions'
import { useDashboard } from '@/composables/useDashboard'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { downloadPayslip } from '@/features/payslips/services/payslip.api'
import { getEmployeeDashboard } from '../services/dashboard.api'
import type { EmployeeDashboardData } from '../types/dashboard'
import { attendanceStatusTone } from '../utils/dashboardDisplay'
import EmployeeAttendanceCard from './EmployeeAttendanceCard.vue'
import EmployeePayslipCard from './EmployeePayslipCard.vue'
import EmployeeLeaveBalanceCards from './EmployeeLeaveBalanceCards.vue'

const auth = useAuthStore()
const { can } = usePermission()
const notify = useNotify()
const { data, loading, error, load } = useDashboard<EmployeeDashboardData>(getEmployeeDashboard)
const downloadLoading = ref(false)

onMounted(load)

const canDownload = computed(() => can('payslips.download_own') || can('payslips.download_any'))

const statusPill = computed(() => {
  const attendance = data.value?.today_attendance
  if (!attendance) return null
  return attendanceStatusTone(attendance.status, attendance.is_late)
})

async function handleDownload() {
  if (!data.value?.latest_approved_payslip) return
  downloadLoading.value = true
  try {
    await downloadPayslip(data.value.latest_approved_payslip.id)
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    downloadLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p class="mt-1 text-sm text-slate-500">
          Welcome back,
          <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>. Your day at a
          glance.
        </p>
      </div>
      <span
        v-if="statusPill"
        class="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium"
        :class="[
          statusPill.wrap,
          statusPill.text,
        ]"
      >
        {{ statusPill.label }} today
      </span>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div v-for="i in 3" :key="i" class="h-40 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
      <button class="ml-3 text-red-600 underline" @click="load">Retry</button>
    </div>

    <template v-else-if="data">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <EmployeeAttendanceCard :attendance="data.today_attendance" />
        <EmployeePayslipCard
          :payslip="data.latest_approved_payslip"
          :can-download="canDownload"
          :download-loading="downloadLoading"
          @download="handleDownload"
        />
      </div>

      <EmployeeLeaveBalanceCards :leave-balance="data.leave_balance" />
    </template>
  </div>
</template>
