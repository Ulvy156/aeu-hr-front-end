<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { BarChart2 } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'

const PayrollReportPage = defineAsyncComponent(() => import('./PayrollReportPage.vue'))
const AttendanceReportPage = defineAsyncComponent(() => import('./AttendanceReportPage.vue'))
const LeaveReportPage = defineAsyncComponent(() => import('./LeaveReportPage.vue'))

const { can } = usePermission()

const canViewPayroll = computed(() => can('reports.payroll_view'))
const canViewAttendance = computed(() => can('reports.attendance_view'))
const canViewLeave = computed(() => can('reports.leave_view'))

const hasAnyAccess = computed(
  () => canViewPayroll.value || canViewAttendance.value || canViewLeave.value
)

// active tab
const activeTab = ref('')

// pick first available tab safely
const firstAvailableTab = computed(() => {
  if (canViewPayroll.value) return 'payroll'
  if (canViewAttendance.value) return 'attendance'
  if (canViewLeave.value) return 'leave'
  return ''
})

// auto-set default tab
watch(
  firstAvailableTab,
  (val) => {
    if (!activeTab.value && val) {
      activeTab.value = val
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start gap-3">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <BarChart2 class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Reports</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Generate and export payroll, attendance, and leave reports.
        </p>
      </div>
    </div>

    <!-- No access -->
    <div
      v-if="!hasAnyAccess"
      class="rounded-lg border border-amber-100 bg-amber-50 p-5 text-sm text-amber-700"
    >
      You do not have permission to view any reports.
    </div>

    <!-- Tabs -->
    <el-tabs
      v-else
      v-model="activeTab"
      type="border-card"
      class="rounded-xl overflow-hidden shadow-sm"
    >
      <el-tab-pane v-if="canViewPayroll" label="Payroll Report" name="payroll">
        <PayrollReportPage />
      </el-tab-pane>

      <el-tab-pane v-if="canViewAttendance" label="Attendance Report" name="attendance">
        <AttendanceReportPage />
      </el-tab-pane>

      <el-tab-pane v-if="canViewLeave" label="Leave Report" name="leave">
        <LeaveReportPage />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>