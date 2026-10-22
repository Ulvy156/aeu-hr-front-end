<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BarChart2 } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { REPORT_GROUPS, REPORTS, type ReportDefinition } from '../constants/reports'
import ReportCatalog from './ReportCatalog.vue'
import ReportWorkspace from './ReportWorkspace.vue'

const { can } = usePermission()

const availableReports = computed(() =>
  REPORTS.filter((report) => can(report.viewPermission)),
)

const hasAnyAccess = computed(() => availableReports.value.length > 0)

const mobileGroups = computed(() =>
  REPORT_GROUPS.map((group) => ({
    ...group,
    reports: availableReports.value.filter((report) => report.group === group.id),
  })).filter((group) => group.reports.length > 0),
)

const selectedId = ref('')

const selectedReport = computed<ReportDefinition | null>(
  () => availableReports.value.find((report) => report.id === selectedId.value) ?? null,
)

watch(
  availableReports,
  (reports) => {
    if (!reports.length) {
      selectedId.value = ''
      return
    }
    if (!reports.some((report) => report.id === selectedId.value)) {
      selectedId.value = reports[0]?.id ?? ''
    }
  },
  { immediate: true },
)

function selectReport(id: string) {
  selectedId.value = id
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start gap-3">
      <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
        <BarChart2 class="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Reports</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Generate and export payroll, attendance, and leave reports.
        </p>
      </div>
    </div>

    <div
      v-if="!hasAnyAccess"
      class="rounded-lg border border-amber-100 bg-amber-50 p-5 text-sm text-amber-700"
    >
      You do not have permission to view any reports.
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside class="hidden lg:block">
        <div class="sticky top-6 rounded-xl border border-gray-200 bg-white p-3">
          <ReportCatalog
            :reports="availableReports"
            :selected-id="selectedId"
            @select="selectReport"
          />
        </div>
      </aside>

      <div class="space-y-4">
        <div class="lg:hidden">
          <label class="mb-1.5 block text-xs font-medium text-slate-500">Report</label>
          <el-select :model-value="selectedId" class="w-full" @update:model-value="selectReport">
            <el-option-group
              v-for="group in mobileGroups"
              :key="group.id"
              :label="group.label"
            >
              <el-option
                v-for="report in group.reports"
                :key="report.id"
                :label="report.title"
                :value="report.id"
              />
            </el-option-group>
          </el-select>
        </div>

        <div
          v-if="selectedReport"
          class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <ReportWorkspace :key="selectedReport.id" :report="selectedReport" />
        </div>
      </div>
    </div>
  </div>
</template>
