<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Download } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useReport } from '@/composables/useReports'
import { getLeaveReport, exportLeaveReport } from '../services/report.api'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import type { LeaveReportItem, LeaveBalanceReportItem } from '../types/report'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const { can } = usePermission()
const { items, summary, meta, loading, exportLoading, error, loadReport, handleExport } =
  useReport(
    (p) => getLeaveReport(p as never),
    (p) => exportLeaveReport(p as never),
  )

const currentYear = new Date().getFullYear()

const reportTypeOptions = [
  { label: 'Request List', value: 'request_list' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Leave Balance', value: 'leave_balance' },
]

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
]

const leaveTypeOptions = [
  { label: 'Annual', value: 'annual' },
  { label: 'Sick', value: 'sick' },
  { label: 'Maternity', value: 'maternity' },
  { label: 'Unpaid', value: 'unpaid' },
]

const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i))

const filters = reactive({
  report_type: 'request_list',
  employee_id: '',
  status: '',
  leave_type: '',
  date_from: '',
  date_to: '',
  year: '',
  page: 1,
  per_page: 15,
})

function buildParams() { return { ...filters } }

function handleSearch() {
  filters.page = 1
  loadReport(buildParams())
}

function handleReset() {
  filters.report_type = 'request_list'
  filters.employee_id = ''
  filters.status = ''
  filters.leave_type = ''
  filters.date_from = ''
  filters.date_to = ''
  filters.year = ''
  filters.page = 1
  loadReport(buildParams())
}

function handlePageChange(page: number) { filters.page = page; loadReport(buildParams()) }
function handleSizeChange(size: number) { filters.per_page = size; filters.page = 1; loadReport(buildParams()) }

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatLeaveType(t: string): string {
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '—'
}

const hasSummary = computed(() => Object.keys(summary.value).length > 0)
const canExport = computed(() => can('reports.leave_export'))
const isBalanceReport = computed(() => filters.report_type === 'leave_balance')

const headerCellStyle = { background: '#f9fafb', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }
</script>

<template>
  <div class="space-y-5">
    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500">Report Type</label>
          <el-select v-model="filters.report_type" class="w-45!">
            <el-option v-for="o in reportTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </div>
        <BaseInput v-model="filters.employee_id" placeholder="Employee ID" clearable class="w-35!" />
        <el-select v-if="!isBalanceReport" v-model="filters.status" placeholder="Status" clearable class="w-35!">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-select v-if="!isBalanceReport" v-model="filters.leave_type" placeholder="Leave Type" clearable class="w-35!">
          <el-option v-for="o in leaveTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-date-picker v-if="!isBalanceReport" v-model="filters.date_from" type="date" placeholder="From" value-format="YYYY-MM-DD" clearable class="w-35!" />
        <el-date-picker v-if="!isBalanceReport" v-model="filters.date_to" type="date" placeholder="To" value-format="YYYY-MM-DD" clearable class="w-35!" />
        <el-select v-if="isBalanceReport" v-model="filters.year" placeholder="Year" clearable class="w-27.5!">
          <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
        </el-select>
        <SearchButton @click="handleSearch" />
        <ResetButton @click="handleReset" />
        <div class="ml-auto">
          <BaseButton
            v-if="canExport"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            :disabled="exportLoading || loading"
            @click="handleExport(buildParams())"
          >
            <Download class="w-4 h-4" />
            {{ exportLoading ? 'Exporting…' : 'Export Excel' }}
          </BaseButton>
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

        <!-- request_list / pending_approval / approved / rejected -->
        <el-table v-if="!isBalanceReport" :data="items as LeaveReportItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Employee" min-width="160">
            <template #default="{ row }">
              <p class="text-xs font-medium text-slate-800">{{ row.employee?.full_name }}</p>
              <p class="text-[11px] text-slate-400">{{ row.employee?.employee_id }}</p>
            </template>
          </el-table-column>
          <el-table-column label="Type" width="100">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatLeaveType(row.leave_type) }}</span></template>
          </el-table-column>
          <el-table-column label="Start" width="120">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatDate(row.start_date) }}</span></template>
          </el-table-column>
          <el-table-column label="End" width="120">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatDate(row.end_date) }}</span></template>
          </el-table-column>
          <el-table-column label="Days" width="70" align="center">
            <template #default="{ row }"><span class="text-xs font-medium text-slate-800">{{ row.total_days }}</span></template>
          </el-table-column>
          <el-table-column label="Status" width="110">
            <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
          </el-table-column>
          <el-table-column label="HR" width="100">
            <template #default="{ row }"><StatusBadge :status="row.hr_approval_status ?? ''" /></template>
          </el-table-column>
          <el-table-column label="CEO" width="100">
            <template #default="{ row }"><StatusBadge :status="row.ceo_approval_status ?? ''" /></template>
          </el-table-column>
          <template #empty><EmptyState title="No leave records found." description="Adjust filters and run the report." /></template>
        </el-table>

        <!-- leave_balance -->
        <el-table v-else :data="items as LeaveBalanceReportItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Employee">
            <template #default="{ row }">
              <p class="text-xs font-medium text-slate-800">{{ row.employee?.full_name }}</p>
              <p class="text-[11px] text-slate-400">{{ row.employee?.employee_id }}</p>
            </template>
          </el-table-column>
          <el-table-column label="Year"  align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row.year }}</span></template>
          </el-table-column>
          <el-table-column label="Annual Leave"  align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row?.annual?.entitlement }}/{{ row?.annual?.remaining }}</span></template>
          </el-table-column>
          <el-table-column label="Sick Leave"  align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row?.sick?.entitlement }}/{{ row?.sick?.remaining }}</span></template>
          </el-table-column>
          <el-table-column label="Maternity Leave"  align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row?.maternity?.entitlement }}/{{ row?.maternity?.remaining }}</span></template>
          </el-table-column>
          <!-- <el-table-column v-for="lt in ['annual', 'sick', 'maternity', 'unpaid']" :key="lt" :label="formatLeaveType(lt)" min-width="130">
            <template #default="{ row }">
              <template v-if="row.balances">
                <template v-for="b in row.balances" :key="b.leave_type">
                  <span v-if="b.leave_type === lt" class="text-xs text-slate-700">
                    {{ b.is_unlimited ? '∞' : `${b.remaining} / ${b.entitlement}` }}
                  </span>
                </template>
              </template>
            </template>
          </el-table-column> -->
          <template #empty><EmptyState title="No leave balance data found." description="Adjust filters and run the report." /></template>
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
