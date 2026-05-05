<script setup lang="ts">
import { onMounted } from 'vue'
import { BarChart2, CalendarDays, Banknote, AlertCircle, CheckCircle } from '@lucide/vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useDashboard } from '@/composables/useDashboard'
import { getCeoDashboard } from '../services/dashboard.api'
import { StatusBadge } from '@/components/common'
import type { CeoDashboardData } from '../types/dashboard'

const auth = useAuthStore()
const { data, loading, error, load } = useDashboard<CeoDashboardData>(getCeoDashboard)

onMounted(load)

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatMonth(m: number): string {
  return MONTH_NAMES[m - 1] ?? String(m)
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

function formatLeaveType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatMoney(v: string): string {
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const headerCellStyle = {
  background: '#f9fafb',
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start gap-3">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <BarChart2 class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">CEO Dashboard</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Welcome back, <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>.
          Today is {{ data?.date ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '…' }}.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-5">
      <div v-for="i in 2" :key="i" class="h-48 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
      <button class="ml-3 underline text-red-600" @click="load">Retry</button>
    </div>

    <template v-else-if="data">
      <!-- Payroll approval summary -->
      <div>
        <h2 class="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <Banknote class="w-4 h-4" /> Payroll Approval
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <p class="text-xs text-slate-400 mb-1">Pending Approval</p>
            <p class="text-3xl font-bold" :class="data.payroll_approval_summary.pending_approval_count > 0 ? 'text-amber-500' : 'text-emerald-600'">
              {{ data.payroll_approval_summary.pending_approval_count }}
            </p>
            <p class="text-xs text-slate-400 mt-1">payroll batches awaiting your approval</p>
          </div>

          <div
            v-if="data.payroll_approval_summary.latest_pending_approval_batch"
            class="rounded-xl border border-amber-100 bg-amber-50 p-5"
          >
            <div class="flex items-center gap-2 mb-3">
              <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
              <p class="text-sm font-semibold text-amber-800">Action Required</p>
            </div>
            <p class="text-sm text-amber-700">
              Payroll for
              <strong>{{ formatMonth(data.payroll_approval_summary.latest_pending_approval_batch.month) }} {{ data.payroll_approval_summary.latest_pending_approval_batch.year }}</strong>
              is waiting for your approval.
            </p>
            <p class="text-xs text-amber-600 mt-2">
              {{ data.payroll_approval_summary.latest_pending_approval_batch.item_count }} employees
              <span v-if="data.payroll_approval_summary.latest_pending_approval_batch.totals">
                · Net {{ formatMoney(data.payroll_approval_summary.latest_pending_approval_batch.totals.net_salary) }}
              </span>
            </p>
          </div>

          <div v-else class="rounded-xl border border-emerald-100 bg-emerald-50 p-5 flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-emerald-600 shrink-0" />
            <p class="text-sm text-emerald-700">No payroll batches pending your approval.</p>
          </div>
        </div>

        <!-- Recent pending batches -->
        <div
          v-if="data.payroll_approval_summary.recent_pending_batches.length > 0"
          class="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <div class="px-5 py-3 border-b border-gray-100">
            <p class="text-sm font-semibold text-slate-800">Recent Pending Batches</p>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="batch in data.payroll_approval_summary.recent_pending_batches"
              :key="batch.id"
              class="px-5 py-3 flex items-center justify-between"
            >
              <p class="text-sm text-slate-700 font-medium">{{ formatMonth(batch.month) }} {{ batch.year }}</p>
              <div class="flex items-center gap-3">
                <span class="text-xs text-slate-400">{{ batch.item_count }} employees</span>
                <StatusBadge :status="batch.status" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending leave approvals -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CalendarDays class="w-4 h-4 text-slate-400" />
            <h2 class="text-sm font-semibold text-slate-800">Pending Leave Approvals</h2>
          </div>
          <span class="text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-100">
            {{ data.pending_leave_approvals.total }} pending
          </span>
        </div>

        <div v-if="data.pending_leave_approvals.items.length">
          <el-table
            :data="data.pending_leave_approvals.items"
            :header-cell-style="headerCellStyle"
            class="w-full"
          >
            <el-table-column label="Employee" min-width="150">
              <template #default="{ row }">
                <p class="text-sm font-medium text-slate-800">{{ row.employee.full_name }}</p>
                <p class="text-xs text-slate-400">{{ row.employee.employee_id }}</p>
              </template>
            </el-table-column>
            <el-table-column label="Type" width="110">
              <template #default="{ row }">
                <span class="text-sm text-slate-700">{{ formatLeaveType(row.leave_type) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Period" min-width="180">
              <template #default="{ row }">
                <span class="text-sm text-slate-700">{{ formatDate(row.start_date) }} → {{ formatDate(row.end_date) }}</span>
                <span class="text-xs text-slate-400 ml-1">({{ row.total_days }}d)</span>
              </template>
            </el-table-column>
            <el-table-column label="Status" width="100">
              <template #default="{ row }">
                <StatusBadge :status="row.status" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 text-center">
          <CalendarDays class="w-10 h-10 text-slate-200 mb-3" />
          <p class="text-sm text-slate-500">No pending leave approvals.</p>
        </div>
      </div>
    </template>
  </div>
</template>
