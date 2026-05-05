<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Download } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useReport } from '@/composables/useReports'
import { getPayrollReport, exportPayrollReport } from '../services/report.api'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import type { PayrollEmployeeListItem, PayrollMonthlySummaryItem, PayrollStatusSummaryItem } from '../types/report'

const { can } = usePermission()
const { items, summary, meta, loading, exportLoading, error, loadReport, handleExport } =
  useReport(
    (p) => getPayrollReport(p as never),
    (p) => exportPayrollReport(p as never),
  )

const currentYear = new Date().getFullYear()

const reportTypeOptions = [
  { label: 'Employee List', value: 'employee_list' },
  { label: 'Monthly Summary', value: 'monthly_summary' },
  { label: 'Status Summary', value: 'status_summary' },
]

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
  value: String(i + 1),
}))
const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i))

const filters = reactive({
  report_type: 'employee_list',
  month: '',
  year: '',
  status: '',
  employee_id: '',
  page: 1,
  per_page: 15,
})

function buildParams() {
  return { ...filters }
}

function handleSearch() {
  filters.page = 1
  loadReport(buildParams())
}

function handleReset() {
  filters.report_type = 'employee_list'
  filters.month = ''
  filters.year = ''
  filters.status = ''
  filters.employee_id = ''
  filters.page = 1
  loadReport(buildParams())
}

function handlePageChange(page: number) {
  filters.page = page
  loadReport(buildParams())
}

function handleSizeChange(size: number) {
  filters.per_page = size
  filters.page = 1
  loadReport(buildParams())
}

function formatMoney(v: unknown): string {
  if (!v) return '—'
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatMonth(m: number): string { return MONTH_NAMES[m - 1] ?? String(m) }

const hasSummary = computed(() => Object.keys(summary.value).length > 0)
const canExport = computed(() => can('reports.payroll_export'))

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
        <el-select v-model="filters.month" placeholder="Month" clearable class="!w-[140px]">
          <el-option v-for="o in monthOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-select v-model="filters.year" placeholder="Year" clearable class="!w-[110px]">
          <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
        </el-select>
        <el-select v-model="filters.status" placeholder="Status" clearable class="!w-[150px]">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-input v-model="filters.employee_id" placeholder="Employee ID" clearable class="!w-[140px]" />
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

    <!-- Summary block -->
    <div v-if="hasSummary" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="(val, key) in summary"
        :key="String(key)"
        class="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
      >
        <p class="text-xs text-slate-400 capitalize mb-1">{{ String(key).replace(/_/g, ' ') }}</p>
        <p class="text-lg font-semibold text-slate-800">{{ val }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Table -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="relative">
        <div v-if="loading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- employee_list -->
        <el-table v-if="filters.report_type === 'employee_list'" :data="items as PayrollEmployeeListItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Employee" min-width="160">
            <template #default="{ row }">
              <p class="text-xs font-medium text-slate-800">{{ row.employee?.full_name }}</p>
              <p class="text-[11px] text-slate-400">{{ row.employee?.employee_id }}</p>
            </template>
          </el-table-column>
          <el-table-column label="Period" width="120">
            <template #default="{ row }">
              <span class="text-xs text-slate-700">{{ formatMonth(row.payroll_batch?.month) }} {{ row.payroll_batch?.year }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Batch Status" width="130">
            <template #default="{ row }"><StatusBadge :status="row.payroll_batch?.status ?? ''" /></template>
          </el-table-column>
          <el-table-column label="Gross" width="120" align="right">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatMoney(row.gross_salary) }}</span></template>
          </el-table-column>
          <el-table-column label="Tax" width="110" align="right">
            <template #default="{ row }"><span class="text-xs text-amber-600">{{ formatMoney(row.tax_amount) }}</span></template>
          </el-table-column>
          <el-table-column label="Net Salary" width="120" align="right">
            <template #default="{ row }"><span class="text-xs font-semibold text-emerald-700">{{ formatMoney(row.net_salary) }}</span></template>
          </el-table-column>
          <el-table-column label="Item Status" width="110">
            <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
          </el-table-column>
          <template #empty><EmptyState title="No payroll records found." description="Adjust filters and run the report." /></template>
        </el-table>

        <!-- monthly_summary -->
        <el-table v-else-if="filters.report_type === 'monthly_summary'" :data="items as PayrollMonthlySummaryItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Period" width="130">
            <template #default="{ row }"><span class="text-xs font-medium text-slate-800">{{ formatMonth(row.month) }} {{ row.year }}</span></template>
          </el-table-column>
          <el-table-column label="Status" width="140">
            <template #default="{ row }"><StatusBadge :status="row.status ?? ''" /></template>
          </el-table-column>
          <el-table-column label="Employees" width="100" align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row.item_count }}</span></template>
          </el-table-column>
          <el-table-column label="Gross" width="130" align="right">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ formatMoney(row.totals?.gross_salary) }}</span></template>
          </el-table-column>
          <el-table-column label="Tax" width="120" align="right">
            <template #default="{ row }"><span class="text-xs text-amber-600">{{ formatMoney(row.totals?.tax_amount) }}</span></template>
          </el-table-column>
          <el-table-column label="Net Salary" width="130" align="right">
            <template #default="{ row }"><span class="text-xs font-semibold text-emerald-700">{{ formatMoney(row.totals?.net_salary) }}</span></template>
          </el-table-column>
          <template #empty><EmptyState title="No payroll batches found." description="Adjust filters and run the report." /></template>
        </el-table>

        <!-- status_summary -->
        <el-table v-else-if="filters.report_type === 'status_summary'" :data="items as PayrollStatusSummaryItem[]" :header-cell-style="headerCellStyle" class="w-full">
          <el-table-column label="Status" width="160">
            <template #default="{ row }"><StatusBadge :status="String(row.status ?? '')" /></template>
          </el-table-column>
          <el-table-column label="Batches" width="100" align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row.batch_count ?? '—' }}</span></template>
          </el-table-column>
          <el-table-column label="Employees" width="100" align="center">
            <template #default="{ row }"><span class="text-xs text-slate-700">{{ row.item_count ?? '—' }}</span></template>
          </el-table-column>
          <template v-for="key in Object.keys(items[0] ?? {}).filter(k => !['status','batch_count','item_count'].includes(k))" :key="key">
            <el-table-column :label="key.replace(/_/g, ' ')" min-width="130" align="right">
              <template #default="{ row }"><span class="text-xs text-slate-700">{{ row[key] }}</span></template>
            </el-table-column>
          </template>
          <template #empty><EmptyState title="No status summary data found." description="Run the report to see results." /></template>
        </el-table>
      </div>

      <!-- Pagination (paginated types only) -->
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
