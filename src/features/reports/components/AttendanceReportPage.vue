<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Download } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useReport } from '@/composables/useReports'
import { getAttendanceReport, exportAttendanceReport } from '../services/report.api'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import type { AttendanceReportItem, AttendanceMonthlySummaryItem } from '../types/report'

const { can } = usePermission()
const { items, summary, meta, loading, exportLoading, error, loadReport, handleExport } =
  useReport(
    (p) => getAttendanceReport(p as never),
    (p) => exportAttendanceReport(p as never),
  )

const currentYear = new Date().getFullYear()

const reportTypeOptions = [
  { label: 'Daily List', value: 'daily_list' },
  { label: 'Monthly Summary', value: 'monthly_summary' },
  { label: 'Late Employees', value: 'late_employees' },
  { label: 'Absent Employees', value: 'absent_employees' },
  { label: 'Correction List', value: 'correction_list' },
]

const statusOptions = [
  { label: 'Present', value: 'present' },
  { label: 'Late', value: 'late' },
  { label: 'Absent', value: 'absent' },
  { label: 'Missing Clock-Out', value: 'missing_clock_out' },
]

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
  value: String(i + 1),
}))
const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i))

const filters = reactive({
  report_type: 'daily_list',
  employee_id: '',
  attendance_date: '',
  date_from: '',
  date_to: '',
  month: '',
  year: '',
  status: '',
  page: 1,
  per_page: 15,
})

function buildParams() { return { ...filters } }

function handleSearch() {
  filters.page = 1
  loadReport(buildParams())
}

function handleReset() {
  filters.report_type = 'daily_list'
  filters.employee_id = ''
  filters.attendance_date = ''
  filters.date_from = ''
  filters.date_to = ''
  filters.month = ''
  filters.year = ''
  filters.status = ''
  filters.page = 1
  loadReport(buildParams())
}

function handlePageChange(page: number) { filters.page = page; loadReport(buildParams()) }
function handleSizeChange(size: number) { filters.per_page = size; filters.page = 1; loadReport(buildParams()) }

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatMonth(m: number): string { return MONTH_NAMES[m - 1] ?? String(m) }

const hasSummary = computed(() => Object.keys(summary.value).length > 0)
const canExport = computed(() => can('reports.attendance_export'))
const isMonthlySummary = computed(() => filters.report_type === 'monthly_summary')

const headerCellStyle = { background: '#f9fafb', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }
</script>

<template>
  <div class="space-y-5">
    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500">Report Type</label>
          <el-select v-model="filters.report_type" class="!w-[180px]">
            <el-option v-for="o in reportTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </div>
        <el-input v-model="filters.employee_id" placeholder="Employee ID" clearable class="!w-[140px]" />
        <el-date-picker v-if="filters.report_type === 'daily_list'" v-model="filters.attendance_date" type="date" placeholder="Date" value-format="YYYY-MM-DD" clearable class="!w-[140px]" />
        <el-date-picker v-model="filters.date_from" type="date" placeholder="From" value-format="YYYY-MM-DD" clearable class="!w-[140px]" />
        <el-date-picker v-model="filters.date_to" type="date" placeholder="To" value-format="YYYY-MM-DD" clearable class="!w-[140px]" />
        <el-select v-model="filters.month" placeholder="Month" clearable class="!w-[140px]">
          <el-option v-for="o in monthOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-select v-model="filters.year" placeholder="Year" clearable class="!w-[110px]">
          <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
        </el-select>
        <el-select v-if="!isMonthlySummary" v-model="filters.status" placeholder="Status" clearable class="!w-[160px]">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <SearchButton @click="handleSearch" />
        <ResetButton @click="handleReset" />
        <div class="ml-auto">
          <button
            v-if="canExport"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            :disabled="exportLoading || loading"
            @click="handleExport(buildParams())"
          >
            <Download class="w-4 h-4" />
            {{ exportLoading ? 'Exporting…' : 'Export Excel' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="hasSummary" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div v-for="(val, key) in summary" :key="String(key)" class="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <p class="text-xs text-slate-400 capitalize mb-1">{{ String(key).replace(/_/g, ' ') }}</p>
        <p class="text-lg font-semibold text-slate-800">{{ val }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <!-- Table -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="relative">
        <div v-if="loading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- daily_list / late_employees / absent_employees -->
        <el-table v-if="!isMonthlySummary && filters.report_type !== 'correction_list'" :data="items as AttendanceReportItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Employee" min-width="160">
            <template #default="{ row }">
              <p class="text-xs font-medium text-slate-800">{{ row.employee?.full_name }}</p>
              <p class="text-[11px] text-slate-400">{{ row.employee?.employee_id }}</p>
            </template>
          </el-table-column>
          <el-table-column label="Date" width="130">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatDate(row.attendance_date) }}</span></template>
          </el-table-column>
          <el-table-column label="Status" width="130">
            <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
          </el-table-column>
          <el-table-column label="Clock In" width="110">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatTime(row.clock_in_time) }}</span></template>
          </el-table-column>
          <el-table-column label="Clock Out" width="110">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatTime(row.clock_out_time) }}</span></template>
          </el-table-column>
          <el-table-column label="Late" width="70" align="center">
            <template #default="{ row }">
              <span v-if="row.is_late" class="text-xs text-amber-600 font-medium">Yes</span>
              <span v-else class="text-xs text-slate-300">—</span>
            </template>
          </el-table-column>
          <template #empty><EmptyState title="No attendance records found." description="Adjust filters and run the report." /></template>
        </el-table>

        <!-- correction_list -->
        <el-table v-else-if="filters.report_type === 'correction_list'" :data="items as AttendanceReportItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Employee" min-width="160">
            <template #default="{ row }">
              <p class="text-xs font-medium text-slate-800">{{ row.employee?.full_name }}</p>
              <p class="text-[11px] text-slate-400">{{ row.employee?.employee_id }}</p>
            </template>
          </el-table-column>
          <el-table-column label="Date" width="130">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatDate(row.attendance_date) }}</span></template>
          </el-table-column>
          <el-table-column label="Status" width="120">
            <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
          </el-table-column>
          <el-table-column label="Clock In" width="110">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatTime(row.clock_in_time) }}</span></template>
          </el-table-column>
          <el-table-column label="Clock Out" width="110">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatTime(row.clock_out_time) }}</span></template>
          </el-table-column>
          <el-table-column label="Corrected At" width="150">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row.corrected_at ? formatDate(row.corrected_at) : '—' }}</span></template>
          </el-table-column>
          <el-table-column label="Reason" min-width="180">
            <template #default="{ row }"><span class="text-xs text-slate-600 max-w-xs truncate block">{{ row.correction_reason ?? '—' }}</span></template>
          </el-table-column>
          <template #empty><EmptyState title="No correction records found." description="Adjust filters and run the report." /></template>
        </el-table>

        <!-- monthly_summary -->
        <el-table v-else :data="items as AttendanceMonthlySummaryItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Employee" min-width="160">
            <template #default="{ row }">
              <p class="text-xs font-medium text-slate-800">{{ row.employee?.full_name }}</p>
              <p class="text-[11px] text-slate-400">{{ row.employee?.employee_id }}</p>
            </template>
          </el-table-column>
          <el-table-column label="Period" width="110">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatMonth(row.month) }} {{ row.year }}</span></template>
          </el-table-column>
          <el-table-column label="Present" width="90" align="center">
            <template #default="{ row }"><span class="text-xs text-emerald-600 font-medium">{{ row.present_count ?? '—' }}</span></template>
          </el-table-column>
          <el-table-column label="Late" width="80" align="center">
            <template #default="{ row }"><span class="text-xs text-amber-500 font-medium">{{ row.late_count ?? '—' }}</span></template>
          </el-table-column>
          <el-table-column label="Absent" width="80" align="center">
            <template #default="{ row }"><span class="text-xs text-red-600 font-medium">{{ row.absent_count ?? '—' }}</span></template>
          </el-table-column>
          <el-table-column label="Missing C/O" width="100" align="center">
            <template #default="{ row }"><span class="text-xs text-slate-500">{{ row.missing_clock_out_count ?? '—' }}</span></template>
          </el-table-column>
          <el-table-column label="Working Days" width="110" align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row.total_working_days ?? '—' }}</span></template>
          </el-table-column>
          <template #empty><EmptyState title="No monthly summary found." description="Adjust filters and run the report." /></template>
        </el-table>
      </div>

      <BasePagination
        v-if="meta"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @update:current-page="handlePageChange"
        @update:page-size="handleSizeChange"
      />
    </div>
  </div>
</template>
