<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { EmptyState } from '@/components/common'
import { useNotify } from '@/composables/useNotify'
import { usePermission } from '@/composables/usePermissions'
import { useReport } from '@/composables/useReports'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  currentMonthValue,
  currentYearValue,
  type ReportDefinition,
  type ReportFilterKey,
} from '../constants/reports'
import {
  exportAttendanceReport,
  exportLeaveReport,
  exportMonthlyLeaveReport,
  exportMonthlyLeaveReportPdf,
  exportPayrollReport,
  getAttendanceReport,
  getLeaveReport,
  getMonthlyLeaveReport,
  getPayrollReport,
} from '../services/report.api'
import AttendanceReportTables from './AttendanceReportTables.vue'
import LeaveReportTables from './LeaveReportTables.vue'
import MonthlyLeaveReportTable from './MonthlyLeaveReportTable.vue'
import PayrollReportTables from './PayrollReportTables.vue'
import ReportFilterBar from './ReportFilterBar.vue'
import ReportResultsCard from './ReportResultsCard.vue'
import ReportSummaryStrip from './ReportSummaryStrip.vue'
import ReportWorkspaceHeader from './ReportWorkspaceHeader.vue'

const props = defineProps<{
  report: ReportDefinition
}>()

const { can } = usePermission()
const notify = useNotify()

const isMonthlyLeave = computed(() => props.report.id === 'leave_monthly')

const emptyFilters = (): Record<ReportFilterKey, string> => ({
  month: isMonthlyLeave.value ? currentMonthValue() : '',
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
const pdfExportLoading = ref(false)

const { items, summary, meta, loading, exportLoading, error, loadReport, handleExport } =
  useReport(
    (params) => {
      if (props.report.group === 'payroll') return getPayrollReport(params as never)
      if (props.report.group === 'attendance') return getAttendanceReport(params as never)
      if (isMonthlyLeave.value) return getMonthlyLeaveReport(params as never)
      return getLeaveReport(params as never)
    },
    (params) => {
      if (props.report.group === 'payroll') return exportPayrollReport(params as never)
      if (props.report.group === 'attendance') return exportAttendanceReport(params as never)
      if (isMonthlyLeave.value) return exportMonthlyLeaveReport(params as never)
      return exportLeaveReport(params as never)
    },
  )

const canExport = computed(() => can(props.report.exportPermission))
const canExportPdf = computed(
  () => Boolean(props.report.supportsPdf) && can(props.report.exportPermission),
)
const hasSummary = computed(() => Object.keys(summary.value).length > 0)
const leaveColumnLabel = computed(() => {
  const label = summary.value.leave_column_label
  return typeof label === 'string' ? label : undefined
})

function buildParams(): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: page.value,
    per_page: perPage.value,
  }
  if (!isMonthlyLeave.value) {
    params.report_type = props.report.apiType
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

async function onExportPdf() {
  pdfExportLoading.value = true
  try {
    await exportMonthlyLeaveReportPdf(buildParams())
    notify.success('PDF exported.')
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    pdfExportLoading.value = false
  }
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
      :can-export-pdf="canExportPdf"
      :pdf-export-loading="pdfExportLoading"
      @export="onExport"
      @export-pdf="onExportPdf"
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
      <MonthlyLeaveReportTable
        v-else-if="isMonthlyLeave"
        :items="items"
        :leave-column-label="leaveColumnLabel"
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
