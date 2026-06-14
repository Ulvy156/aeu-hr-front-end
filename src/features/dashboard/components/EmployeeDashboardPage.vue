<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Clock, Calendar, FileText, Download, Loader2 } from '@lucide/vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermission } from '@/composables/usePermissions'
import { useDashboard } from '@/composables/useDashboard'
import { getEmployeeDashboard } from '../services/dashboard.api'
import { downloadPayslip } from '@/features/payslips/services/payslip.api'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { ref } from 'vue'
import type { EmployeeDashboardData } from '../types/dashboard'

const auth = useAuthStore()
const { can } = usePermission()
const notify = useNotify()
const { data, loading, error, load } = useDashboard<EmployeeDashboardData>(getEmployeeDashboard)
const downloadLoading = ref(false)

onMounted(load)

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatMonth(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month)
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatMoney(v: string): string {
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getLeaveColor(type: string): string {
  const map: Record<string, string> = {
    annual: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    sick: 'bg-blue-50 border-blue-100 text-blue-600',
    special: 'bg-amber-50 border-amber-100 text-amber-600',
    maternity: 'bg-purple-50 border-purple-100 text-purple-600',
    unpaid: 'bg-slate-50 border-slate-100 text-slate-500',
  }
  return map[type] ?? 'bg-slate-50 border-slate-100 text-slate-500'
}

function formatLeaveType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1) + ' Leave'
}

const canDownload = computed(() => can('payslips.download_own') || can('payslips.download_any'))

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

function getStatusBg(status: string, isLate: boolean): string {
  if (isLate) return 'bg-amber-50 border-amber-100'
  if (status === 'present') return 'bg-emerald-50 border-emerald-100'
  if (status === 'absent') return 'bg-red-50 border-red-100'
  return 'bg-slate-50 border-slate-100'
}

function getStatusText(status: string, isLate: boolean): string {
  if (isLate) return 'text-amber-700'
  if (status === 'present') return 'text-emerald-700'
  if (status === 'absent') return 'text-red-700'
  return 'text-slate-600'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="mb-2">
      <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">
        Welcome back, <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>.
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div v-for="i in 3" :key="i" class="h-36 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
      <button class="ml-3 underline text-red-600" @click="load">Retry</button>
    </div>

    <template v-else-if="data">
      <!-- Top row: Attendance + Payslip -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Today's Attendance -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Clock class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">Today's Attendance</p>
              <p class="text-xs text-slate-400">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</p>
            </div>
          </div>

          <div
            v-if="data.today_attendance"
            class="rounded-lg border p-4 space-y-3"
            :class="getStatusBg(data.today_attendance.status, data.today_attendance.is_late)"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold" :class="getStatusText(data.today_attendance.status, data.today_attendance.is_late)">
                {{ data.today_attendance.is_late ? 'Late' : data.today_attendance.status.charAt(0).toUpperCase() + data.today_attendance.status.slice(1) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">Clock In</p>
                <p class="font-semibold text-slate-800">{{ formatTime(data.today_attendance.clock_in_time) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">Clock Out</p>
                <p class="font-semibold" :class="data.today_attendance.clock_out_time ? 'text-slate-800' : 'text-slate-400'">
                  {{ data.today_attendance.clock_out_time ? formatTime(data.today_attendance.clock_out_time) : 'Not yet' }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <Clock class="w-10 h-10 text-slate-200 mb-3" />
            <p class="text-sm font-medium text-slate-600">No attendance today</p>
            <p class="text-xs text-slate-400 mt-1">You haven't clocked in yet today.</p>
          </div>
        </div>

        <!-- Latest Payslip -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <FileText class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">Latest Payslip</p>
              <p class="text-xs text-slate-400">Most recent approved payslip</p>
            </div>
          </div>

          <div v-if="data.latest_approved_payslip" class="space-y-3">
            <p class="text-sm font-semibold text-slate-700">
              {{ formatMonth(data.latest_approved_payslip.payroll_batch.month) }}
              {{ data.latest_approved_payslip.payroll_batch.year }}
            </p>
            <div class="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">Gross</p>
                <p class="font-medium text-slate-800">{{ formatMoney(data.latest_approved_payslip.gross_salary) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">Tax</p>
                <p class="font-medium text-amber-600">{{ formatMoney(data.latest_approved_payslip.tax_amount) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">Net</p>
                <p class="text-lg font-bold text-emerald-700">{{ formatMoney(data.latest_approved_payslip.net_salary) }}</p>
              </div>
            </div>

            <button
              v-if="canDownload"
              class="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              :disabled="downloadLoading"
              @click="handleDownload"
            >
              <Loader2 v-if="downloadLoading" class="w-4 h-4 animate-spin" />
              <Download v-else class="w-4 h-4" />
              {{ downloadLoading ? 'Downloading…' : 'Download PDF' }}
            </button>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <FileText class="w-10 h-10 text-slate-200 mb-3" />
            <p class="text-sm font-medium text-slate-600">No payslip yet</p>
            <p class="text-xs text-slate-400 mt-1">Approved payslips will appear here.</p>
          </div>
        </div>
      </div>

      <!-- Leave Balance -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-3 mb-5">
          <div class="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Calendar class="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-800">Leave Balance</p>
            <p class="text-xs text-slate-400">{{ data.leave_balance?.year ?? new Date().getFullYear() }}</p>
          </div>
        </div>

        <div v-if="data.leave_balance?.balances?.length" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="balance in data.leave_balance.balances"
            :key="balance.leave_type"
            class="rounded-xl border p-4"
            :class="getLeaveColor(balance.leave_type)"
          >
            <p class="text-xs font-medium mb-2">{{ formatLeaveType(balance.leave_type) }}</p>
            <template v-if="balance.is_unlimited">
              <p class="text-2xl font-bold">∞</p>
              <p class="text-xs mt-1 opacity-70">Unlimited</p>
            </template>
            <template v-else>
              <div class="flex items-end gap-1">
                <p class="text-2xl font-bold">{{ balance.remaining }}</p>
                <p class="text-xs mb-0.5 opacity-70">/ {{ balance.entitlement }}</p>
              </div>
              <p class="text-xs mt-1 opacity-70">{{ balance.used }} used</p>
            </template>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-8 text-center">
          <Calendar class="w-10 h-10 text-slate-200 mb-3" />
          <p class="text-sm font-medium text-slate-600">No leave balance data.</p>
        </div>
      </div>
    </template>
  </div>
</template>
