<script setup lang="ts">
import { REPORT_GROUPS, type ReportDefinition, type ReportGroup } from '../constants/reports'

defineProps<{
  reports: ReportDefinition[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

function groupReports(reports: ReportDefinition[], group: ReportGroup): ReportDefinition[] {
  return reports.filter((report) => report.group === group)
}
</script>

<template>
  <nav class="space-y-5" aria-label="Report catalog">
    <template v-for="group in REPORT_GROUPS" :key="group.id">
      <div v-if="groupReports(reports, group.id).length">
        <p class="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {{ group.label }}
        </p>
        <div class="mt-1 space-y-0.5">
          <button
            v-for="report in groupReports(reports, group.id)"
            :key="report.id"
            type="button"
            class="block w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
            :class="
              report.id === selectedId
                ? 'bg-emerald-50 font-medium text-emerald-700'
                : 'text-slate-600 hover:bg-gray-50'
            "
            @click="emit('select', report.id)"
          >
            {{ report.title }}
          </button>
        </div>
      </div>
    </template>
  </nav>
</template>
