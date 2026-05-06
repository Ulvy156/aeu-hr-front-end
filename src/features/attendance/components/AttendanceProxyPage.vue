<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserCheck, ShieldX } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { fetchAttendance } from '../services/attendance.api'
import { AppCard } from '@/components/common'
import type { Attendance, PaginationMeta } from '../types/attendance'
import ProxyClockForm from './ProxyClockForm.vue'
import AttendanceTable from './AttendanceTable.vue'

const { can } = usePermission()
const canProxy = computed(() => can('attendance.proxy_clock'))
const canViewAny = computed(() => can('attendance.view_any'))

const attendances = ref<Attendance[]>([])
const meta = ref<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
const tableLoading = ref(false)
const filterEmployeeId = ref<number | null>(null)
const filterDate = ref('')
const tablePage = ref(1)

async function loadTable() {
  tableLoading.value = true
  try {
    const params: Record<string, unknown> = { page: tablePage.value, per_page: 10 }
    if (filterEmployeeId.value) params.employee_id = filterEmployeeId.value
    if (filterDate.value) {
      params.date_from = filterDate.value
      params.date_to = filterDate.value
    }
    const res = await fetchAttendance(params)
    attendances.value = res.data
    meta.value = res.meta
  } catch {
    // silent
  } finally {
    tableLoading.value = false
  }
}

function handleProxySuccess(attendance: Attendance) {
  filterEmployeeId.value = attendance.employee.id
  filterDate.value = attendance.attendance_date
  tablePage.value = 1
  loadTable()
}

function onPageChange(page: number) {
  tablePage.value = page
  loadTable()
}

function onPageSizeChange(size: number) {
  meta.value.per_page = size
  tablePage.value = 1
  loadTable()
}

onMounted(loadTable)
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center gap-3">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <UserCheck class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Proxy Clock-In / Clock-Out</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Record clock-in or clock-out on behalf of an employee.
        </p>
      </div>
    </div>

    <!-- 403 guard -->
    <div
      v-if="!canProxy"
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 py-16 text-center"
    >
      <ShieldX class="w-10 h-10 text-red-400" />
      <p class="text-base font-semibold text-red-700">Access Denied</p>
      <p class="text-sm text-red-500">You do not have permission to perform proxy clock actions.</p>
    </div>

    <template v-else>
      <!-- Action cards -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProxyClockForm type="clock_in" @success="handleProxySuccess" />
        <ProxyClockForm type="clock_out" @success="handleProxySuccess" />
      </div>

      <!-- Attendance table -->
      <AppCard no-padding>
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">Attendance Records</h3>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ filterEmployeeId ? 'Filtered by selected employee and date.' : 'All recent attendance records.' }}
            </p>
          </div>
          <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
        </div>

        <AttendanceTable
          :attendances="attendances"
          :loading="tableLoading"
          :can-view-any="canViewAny"
          :current-page="meta.current_page"
          :page-size="meta.per_page"
          :total="meta.total"
          @page-change="onPageChange"
          @size-change="onPageSizeChange"
        />
      </AppCard>
    </template>
  </div>
</template>
