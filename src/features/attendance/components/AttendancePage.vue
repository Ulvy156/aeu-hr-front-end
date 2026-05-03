<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Clock, UserX } from '@lucide/vue'
import { AppCard, BaseButton } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import { useAttendance } from '../composables/useAttendance'
import type { Attendance } from '../types/attendance'
import ClockInOutCard from './ClockInOutCard.vue'
import AttendanceFilters from './AttendanceFilters.vue'
import AttendanceTable from './AttendanceTable.vue'
import AttendanceCorrectionDialog from './AttendanceCorrectionDialog.vue'
import MarkAbsentDialog from './MarkAbsentDialog.vue'

const { can } = usePermission()
const { attendances, meta, loading, loadAttendance, applyFilters, onPageChange, onPageSizeChange } =
  useAttendance()

const correctionOpen = ref(false)
const markAbsentOpen = ref(false)
const selectedAttendance = ref<Attendance | null>(null)

const canViewAny = computed(() => can('attendance.view_any'))
const showClockCard = computed(() => can('attendance.clock_in') || can('attendance.clock_out'))

onMounted(loadAttendance)

function handleCorrect(attendance: Attendance) {
  selectedAttendance.value = attendance
  correctionOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
          <Clock class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Attendance</h1>
          <p class="mt-0.5 text-sm text-slate-500">View and manage employee attendance records.</p>
        </div>
      </div>
      <BaseButton
        v-if="can('attendance.mark_absent')"
        :icon="UserX"
        @click="markAbsentOpen = true"
      >
        Mark Absent
      </BaseButton>
    </div>

    <!-- Clock In/Out card -->
    <ClockInOutCard v-if="showClockCard" @clocked="loadAttendance" />

    <!-- Filters -->
    <AttendanceFilters @apply="applyFilters" />

    <!-- Table card -->
    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Attendance Records</h3>
          <p class="text-xs text-slate-400 mt-0.5">Clock-in, clock-out, and status for each working day.</p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
      </div>

      <AttendanceTable
        :attendances="attendances"
        :loading="loading"
        :can-view-any="canViewAny"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @correct="handleCorrect"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <AttendanceCorrectionDialog
      v-model:visible="correctionOpen"
      :attendance="selectedAttendance"
      @saved="loadAttendance"
    />

    <MarkAbsentDialog
      v-model:visible="markAbsentOpen"
      @marked="loadAttendance"
    />
  </div>
</template>
