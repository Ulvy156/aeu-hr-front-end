<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Clock } from '@lucide/vue'
import { AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useAttendance } from '../composables/useAttendance'
import ClockInOutCard from './ClockInOutCard.vue'
import AttendanceSummaryCards from './AttendanceSummaryCards.vue'
import AttendanceFilters from './AttendanceFilters.vue'
import AttendanceTable from './AttendanceTable.vue'

const { can } = usePermission()
const { attendances, meta, loading, loadAttendance, applyFilters, onPageChange, onPageSizeChange } =
  useAttendance('own')
const summaryCards = ref<{ load: () => Promise<void> } | null>(null)

onMounted(() => { void loadAttendance() })

function handleAttendanceChanged() {
  void loadAttendance()
  void summaryCards.value?.load()
}

</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
        <Clock class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">My Attendance</h1>
        <p class="mt-0.5 text-sm text-slate-500">View your attendance and clock in or out.</p>
      </div>
    </div>

    <ClockInOutCard
      v-if="can('attendance.clock_in') || can('attendance.clock_out')"
      @clocked="handleAttendanceChanged"
    />

    <AttendanceSummaryCards ref="summaryCards" />

    <AttendanceFilters :can-view-any="false" :departments="[]" @apply="applyFilters" />

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">My Attendance Records</h3>
          <p class="text-xs text-slate-400 mt-0.5">Saved records only. Missed workdays without a record count in the summary above.</p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
      </div>

      <AttendanceTable
        :attendances="attendances"
        :loading="loading"
        :can-view-any="false"
        :allow-corrections="false"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

  </div>
</template>
