<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Clock, CheckCircle2, MapPin } from '@lucide/vue'
import { clockIn, clockOut, fetchAttendance, fetchAttendanceSummary } from '../services/attendance.api'
import type { AttendanceTodayData } from '../types/attendance'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermission } from '@/composables/usePermissions'
import { useNotify } from '@/composables/useNotify'
import { getCurrentLocation } from '@/utils/getCurrentLocation'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { BaseButton } from '@/components/common'
import { formatAttendanceTime, localAttendanceDate } from '../utils/formatAttendance'

const emit = defineEmits<{ clocked: [] }>()

const auth = useAuthStore()
const { can } = usePermission()
const notify = useNotify()
const gpsLoading = ref(false)
const submitting = ref(false)
const loadingToday = ref(true)
const todayRecord = ref<Pick<AttendanceTodayData, 'clock_in_time' | 'clock_out_time'> | null>(null)

const today = localAttendanceDate()
const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const hasClockedIn = computed(() => Boolean(todayRecord.value?.clock_in_time))
const hasClockedOut = computed(() => Boolean(todayRecord.value?.clock_out_time))
const isComplete = computed(() => hasClockedIn.value && hasClockedOut.value)

function applyTodayState(record: { clock_in_time: string | null; clock_out_time: string | null } | null) {
  todayRecord.value = record
    ? { clock_in_time: record.clock_in_time, clock_out_time: record.clock_out_time }
    : null
}

async function loadTodayFromList() {
  const params: Record<string, unknown> = {
    attendance_date: today,
    per_page: 1,
  }
  const employeeCode = auth.user?.employee?.employee_id
  if (employeeCode) params.employee_id = employeeCode

  const res = await fetchAttendance(params)
  applyTodayState(res.data[0] ?? null)
}

async function loadToday() {
  loadingToday.value = true
  try {
    const res = await fetchAttendanceSummary()
    applyTodayState(res.data.today)
  } catch {
    try {
      await loadTodayFromList()
    } catch {
      // silent — user can still try to clock in/out
    }
  } finally {
    loadingToday.value = false
  }
}

async function handleAction(action: 'clock-in' | 'clock-out') {
  gpsLoading.value = true
  let coords: { latitude: number; longitude: number }
  try {
    coords = await getCurrentLocation()
  } catch {
    gpsLoading.value = false
    return
  }
  gpsLoading.value = false

  submitting.value = true
  try {
    const res = action === 'clock-in' ? await clockIn(coords) : await clockOut(coords)
    applyTodayState(res.data)
    notify.success(res.message)
    emit('clocked')
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    submitting.value = false
  }
}

onMounted(loadToday)
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
    <div class="flex items-center gap-3 mb-5">
      <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
        <Clock class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h2 class="text-base font-semibold text-slate-900">Today's Attendance</h2>
        <p class="text-xs text-slate-400 mt-0.5">{{ todayLabel }}</p>
      </div>
    </div>

    <div v-if="loadingToday" class="space-y-3">
      <el-skeleton :rows="2" animated />
    </div>

    <div v-else>
      <div v-if="isComplete" class="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100 mb-4">
        <CheckCircle2 class="w-5 h-5 text-green-600 shrink-0" />
        <div class="text-sm">
          <p class="font-medium text-green-800">Attendance complete for today</p>
          <p class="text-green-600 mt-0.5">
            Clock in: {{ formatAttendanceTime(todayRecord!.clock_in_time) }} · Clock out: {{ formatAttendanceTime(todayRecord!.clock_out_time) }}
          </p>
        </div>
      </div>

      <div v-else-if="hasClockedIn" class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
        <Clock class="w-4 h-4 text-blue-600 shrink-0" />
        <div class="text-sm">
          <p class="font-medium text-blue-800">Clocked in at {{ formatAttendanceTime(todayRecord!.clock_in_time) }}</p>
          <p class="text-blue-500 mt-0.5">Don't forget to clock out when you leave.</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton
          v-if="can('attendance.clock_in') && !hasClockedIn"
          type="primary"
          :loading="gpsLoading || submitting"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
          @click="handleAction('clock-in')"
        >
          <MapPin v-if="!gpsLoading && !submitting" class="w-4 h-4 mr-1.5" />
          {{ gpsLoading ? 'Getting location…' : submitting ? 'Clocking in…' : 'Clock In' }}
        </BaseButton>

        <BaseButton
          v-if="can('attendance.clock_out') && hasClockedIn && !hasClockedOut"
          type="primary"
          :loading="gpsLoading || submitting"
          @click="handleAction('clock-out')"
        >
          <MapPin v-if="!gpsLoading && !submitting" class="w-4 h-4 mr-1.5" />
          {{ gpsLoading ? 'Getting location…' : submitting ? 'Clocking out…' : 'Clock Out' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
