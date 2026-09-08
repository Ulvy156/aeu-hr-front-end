<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ClipboardList } from '@lucide/vue'
import { AppCard } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useAttendanceCorrection } from '../composables/useAttendanceCorrection'
import { CORRECTION_QUEUE_STATUS } from '../types/attendance'
import type { Attendance, CorrectionQueue } from '../types/attendance'
import AttendanceCorrectionQueueStats from './AttendanceCorrectionQueueStats.vue'
import AttendanceCorrectionFilters from './AttendanceCorrectionFilters.vue'
import AttendanceCorrectionTable from './AttendanceCorrectionTable.vue'
import AttendanceCorrectionPanel from './AttendanceCorrectionPanel.vue'

const { can } = usePermission()
const {
  attendances,
  meta,
  loading,
  counts,
  countsLoading,
  filters,
  loadAttendance,
  loadCounts,
  setQueue,
  applyFilters,
  resetFilters,
  onPageChange,
  onPageSizeChange,
} = useAttendanceCorrection()

const selectedAttendance = ref<Attendance | null>(null)
const canViewAny = computed(() => can('attendance.view_any'))

const tableTitle = computed(() =>
  filters.queue === 'needs_review' ? 'Missing clock-out queue' : 'Attendance records',
)

const emptyCopy = computed(() => {
  if (filters.queue === 'needs_review') {
    return {
      title: 'No missing clock-out records.',
      description: 'Reset filters or open All records.',
    }
  }
  return {
    title: 'No attendance records found.',
    description: 'Try adjusting your filters or date range.',
  }
})

onMounted(() => {
  loadAttendance()
  loadCounts()
})

function handleQueue(queue: CorrectionQueue) {
  selectedAttendance.value = null
  setQueue(queue)
}

function handleApply(employeeId: number | null, dateFrom: string, dateTo: string) {
  selectedAttendance.value = null
  applyFilters(employeeId, dateFrom, dateTo)
}

function handleReset() {
  selectedAttendance.value = null
  resetFilters()
}

function handleSelect(attendance: Attendance) {
  selectedAttendance.value = attendance
}

function handleClosePanel() {
  selectedAttendance.value = null
}

function queueMatches(row: Attendance, queue: CorrectionQueue): boolean {
  const status = CORRECTION_QUEUE_STATUS[queue]
  if (!status) return true
  return row.status === status
}

function handleSaved(updated: Attendance) {
  loadAttendance()
  loadCounts()
  if (!queueMatches(updated, filters.queue)) {
    selectedAttendance.value = null
    return
  }
  selectedAttendance.value = updated
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
        <ClipboardList class="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Attendance Correction</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Review exception days and correct clock times with a required reason.
        </p>
      </div>
    </div>

    <AttendanceCorrectionQueueStats
      :counts="counts"
      :queue="filters.queue"
      :loading="countsLoading"
      @select="handleQueue"
    />

    <AttendanceCorrectionFilters
      :queue="filters.queue"
      :employee-id="filters.employee_id"
      :date-from="filters.date_from"
      :date-to="filters.date_to"
      :counts="counts"
      :can-view-any="canViewAny"
      @update:queue="handleQueue"
      @apply="handleApply"
      @reset="handleReset"
    />

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <AppCard no-padding>
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">{{ tableTitle }}</h3>
            <p class="mt-0.5 text-xs text-slate-400">
              Select a record to correct it without leaving the list.
            </p>
          </div>
          <span class="text-xs font-medium text-slate-400">{{ meta.total }} records</span>
        </div>

        <AttendanceCorrectionTable
          :attendances="attendances"
          :loading="loading"
          :can-view-any="canViewAny"
          :selected-id="selectedAttendance?.id ?? null"
          :current-page="meta.current_page"
          :page-size="meta.per_page"
          :total="meta.total"
          :empty-title="emptyCopy.title"
          :empty-description="emptyCopy.description"
          @select="handleSelect"
          @page-change="onPageChange"
          @size-change="onPageSizeChange"
        />
      </AppCard>

      <div class="xl:sticky xl:top-6">
        <AttendanceCorrectionPanel
          :attendance="selectedAttendance"
          @close="handleClosePanel"
          @saved="handleSaved"
        />
      </div>
    </div>
  </div>
</template>
