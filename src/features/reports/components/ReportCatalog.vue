<script setup lang="ts">
import { computed } from 'vue'
import {
  REPORT_GROUPS,
  type ReportDefinition,
  type ReportGroup,
} from '../constants/reports'

const props = defineProps<{
  reports: ReportDefinition[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const availableGroups = computed(() =>
  REPORT_GROUPS.filter((group) => props.reports.some((report) => report.group === group.id)),
)

const activeGroup = computed<ReportGroup>(() => {
  const selected = props.reports.find((report) => report.id === props.selectedId)
  return selected?.group ?? availableGroups.value[0]?.id ?? 'payroll'
})

const groupReports = computed(() =>
  props.reports.filter((report) => report.group === activeGroup.value),
)

function selectGroup(groupId: ReportGroup) {
  if (groupId === activeGroup.value) return
  const first = props.reports.find((report) => report.group === groupId)
  if (first) emit('select', first.id)
}

function groupTabClass(active: boolean): string {
  return active
    ? 'border-b-2 border-emerald-600 font-medium text-emerald-700'
    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
}

function pillClass(active: boolean): string {
  return active
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50'
}
</script>

<template>
  <nav class="flex flex-col gap-3" aria-label="Report catalog">
    <div class="flex flex-wrap gap-4 border-b border-gray-100">
      <button
        v-for="group in availableGroups"
        :key="group.id"
        type="button"
        class="-mb-px pb-2 text-sm transition-colors"
        :class="groupTabClass(group.id === activeGroup)"
        @click="selectGroup(group.id)"
      >
        {{ group.label }}
      </button>
    </div>

    <div>
      <p class="mb-1.5 text-xs font-medium text-slate-500">Report</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="report in groupReports"
          :key="report.id"
          type="button"
          class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
          :class="pillClass(report.id === selectedId)"
          @click="emit('select', report.id)"
        >
          {{ report.title }}
        </button>
      </div>
    </div>
  </nav>
</template>
