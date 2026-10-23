<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BarChart2 } from '@lucide/vue'
import { AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { REPORTS, type ReportDefinition } from '../constants/reports'
import ReportCatalog from './ReportCatalog.vue'
import ReportWorkspace from './ReportWorkspace.vue'

const { can } = usePermission()

const availableReports = computed(() =>
  REPORTS.filter((report) => can(report.viewPermission)),
)

const hasAnyAccess = computed(() => availableReports.value.length > 0)

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

    <AppCard v-else no-padding>
      <template #header>
        <ReportCatalog
          :reports="availableReports"
          :selected-id="selectedId"
          @select="selectReport"
        />
      </template>

      <ReportWorkspace
        v-if="selectedReport"
        :key="selectedReport.id"
        :report="selectedReport"
      />
    </AppCard>
  </div>
</template>
