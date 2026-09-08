<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, BarChart2 } from '@lucide/vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useDashboard } from '@/composables/useDashboard'
import { getHrDashboard } from '../services/dashboard.api'
import type { HrDashboardData } from '../types/dashboard'
import {
  formatDashboardLongDate,
  formatDashboardMoney,
  formatDashboardMonth,
} from '../utils/dashboardDisplay'
import HrAttendanceCards from './HrAttendanceCards.vue'
import HrAttendanceMix from './HrAttendanceMix.vue'
import HrPayrollPipeline from './HrPayrollPipeline.vue'
import HrNeedsAttention from './HrNeedsAttention.vue'
import HrPendingLeavesCard from './HrPendingLeavesCard.vue'

const router = useRouter()
const auth = useAuthStore()
const { data, loading, error, load } = useDashboard<HrDashboardData>(getHrDashboard)

onMounted(load)

function goLeaves() {
  router.push({ name: 'leaves' })
}

function goPayroll() {
  const batch = data.value?.payroll_status.latest_pending_approval_batch
  if (batch) {
    router.push({ name: 'payroll-detail', params: { id: batch.id } })
    return
  }
  router.push({ name: 'payrolls' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
          <BarChart2 class="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">HR Dashboard</h1>
          <p class="mt-0.5 text-sm text-slate-500">
            Welcome back,
            <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>. Today is
            {{ formatDashboardLongDate(data?.date) }}.
          </p>
        </div>
      </div>
      <span
        v-if="data && data.pending_leave_requests.total > 0"
        class="shrink-0 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
      >
        {{ data.pending_leave_requests.total }} leave pending
      </span>
    </div>

    <div v-if="loading" class="space-y-5">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="i in 4"
          :key="i"
          class="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
        />
      </div>
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
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
      <HrAttendanceCards :summary="data.today_attendance_summary" />

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <HrAttendanceMix :summary="data.today_attendance_summary" />

        <div class="space-y-4">
          <div
            v-if="data.payroll_status.latest_pending_approval_batch"
            class="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4"
          >
            <AlertCircle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p class="text-sm font-semibold text-amber-800">Payroll waiting on CEO</p>
              <p class="mt-1 text-sm text-amber-700">
                {{
                  formatDashboardMonth(
                    data.payroll_status.latest_pending_approval_batch.month,
                    data.payroll_status.latest_pending_approval_batch.year,
                  )
                }}
                · {{ data.payroll_status.latest_pending_approval_batch.item_count }} employees
                <template v-if="data.payroll_status.latest_pending_approval_batch.totals">
                  · net
                  {{
                    formatDashboardMoney(
                      data.payroll_status.latest_pending_approval_batch.totals.net_salary,
                    )
                  }}
                </template>
                . Open Payroll to track status.
              </p>
            </div>
          </div>

          <HrPayrollPipeline :counts="data.payroll_status.counts" />

          <HrNeedsAttention
            :pending-leaves="data.pending_leave_requests"
            :pending-payroll="data.payroll_status.latest_pending_approval_batch"
            @review-leaves="goLeaves"
            @open-payroll="goPayroll"
          />
        </div>
      </div>

      <HrPendingLeavesCard :section="data.pending_leave_requests" />
    </template>
  </div>
</template>
