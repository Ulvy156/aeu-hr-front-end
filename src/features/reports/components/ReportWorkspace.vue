<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { EmptyState } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useReport } from '@/composables/useReports'
import {
  currentYearValue,
  type ReportDefinition,
  type ReportFilterKey,
} from '../constants/reports'
import {
  exportAttendanceReport,
  exportLeaveReport,
  exportPayrollReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
} from '../services/report.api'
import AttendanceReportTables from './AttendanceReportTables.vue'
import LeaveReportTables from './LeaveReportTables.vue'
import PayrollReportTables from './PayrollReportTables.vue'
import ReportFilterBar from './ReportFilterBar.vue'
import ReportResultsCard from './ReportResultsCard.vue'
import ReportSummaryStrip from './ReportSummaryStrip.vue'
import ReportWorkspaceHeader from './ReportWorkspaceHeader.vue'

const props = defineProps<{
  report: ReportDefinition
}>()

const { can } = usePermission()

const emptyFilters = (): Record<ReportFilterKey, string> => ({
  month: '',
  year: currentYearValue(),
  status: '',
  employee_id: '',
  attendance_date: '',
  date_from: '',
  date_to: '',
  leave_type: '',
})

const filters = reactive(emptyFilters())
const hasSearched = ref(false)
const page = ref(1)
const perPage = ref(15)

const { items, summary, meta, loading, exportLoading, error, loadReport, handleExport } =
  useReport(
    (params) => {
      if (props.report.group === 'payroll') return getPayrollReport(params as never)
      if (props.report.group === 'attendance') return getAttendanceReport(params as never)
      return getLeaveReport(params as never)
    },
    (params) => {
      if (props.report.group === 'payroll') return exportPayrollReport(params as never)
      if (props.report.group === 'attendance') return exportAttendanceReport(params as never)
      return exportLeaveReport(params as never)
    },
  )

const canExport = computed(() => can(props.report.exportPermission))
const hasSummary = computed(() => Object.keys(summary.value).length > 0)

function buildParams(): Record<string, unknown> {
  const params: Record<string, unknown> = {
    report_type: props.report.apiType,
    page: page.value,
    per_page: perPage.value,
  }
  for (const key of props.report.filters) {
    const value = filters[key]
    if (value) params[key] = value
  }
  return params
}

function clearResults() {
  items.value = []
  summary.value = {}
  meta.value = null
  error.value = null
  hasSearched.value = false
}

function resetFilters() {
  Object.assign(filters, emptyFilters())
  page.value = 1
}

function onSearch() {
  page.value = 1
  hasSearched.value = true
  loadReport(buildParams())
}

function onReset() {
  resetFilters()
  clearResults()
}

function onFilterUpdate(key: ReportFilterKey, value: string) {
  filters[key] = value
}

function onPageChange(nextPage: number) {
  page.value = nextPage
  loadReport(buildParams())
}

function onPageSizeChange(size: number) {
  perPage.value = size
  page.value = 1
  loadReport(buildParams())
}

function onExport() {
  handleExport(buildParams())
}

watch(
  () => props.report.id,
  () => {
    resetFilters()
    clearResults()
  },
)
</script>

<template>
  <div class="space-y-5">
    <ReportWorkspaceHeader
      :title="report.title"
      :description="report.description"
      :can-export="canExport"
      :export-loading="exportLoading"
      :loading="loading"
      @export="onExport"
    />

    <ReportFilterBar
      :report="report"
      :filters="filters"
      @update:filters="onFilterUpdate"
      @search="onSearch"
      @reset="onReset"
    />

    <ReportSummaryStrip
      v-if="hasSearched && hasSummary"
      :group="report.group"
      :report-type="report.apiType"
      :summary="summary"
    />

    <ReportResultsCard
      v-if="hasSearched"
      :loading="loading"
      :error="error"
      :meta="meta"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <PayrollReportTables
        v-if="report.group === 'payroll'"
        :report-type="report.apiType"
        :items="items"
      />
      <AttendanceReportTables
        v-else-if="report.group === 'attendance'"
        :report-type="report.apiType"
        :items="items"
      />
      <LeaveReportTables v-else :report-type="report.apiType" :items="items" />
    </ReportResultsCard>

    <div
      v-else
      class="rounded-xl border border-dashed border-gray-200 bg-slate-50/60 px-6 py-14"
    >
      <EmptyState
        title="Choose filters and search"
        description="Pick the filters for this report, then run Search to load results."
      />
    </div>
  </div>
</template>
