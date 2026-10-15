<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Clock, CheckCircle2, MapPin } from '@lucide/vue'
import { clockIn, clockOut, fetchAttendanceSummary } from '../services/attendance.api'
import type { AttendanceActions, AttendanceTodayData } from '../types/attendance'
import { useNotify } from '@/composables/useNotify'
import { getCurrentLocation } from '@/utils/getCurrentLocation'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { BaseButton } from '@/components/common'
import { formatAttendanceTime } from '../utils/formatAttendance'

const emit = defineEmits<{ clocked: [] }>()
const notify = useNotify()
const gpsLoading = ref(false)
const submitting = ref(false)
const loadingToday = ref(true)
const loadFailed = ref(false)
const actions = ref<AttendanceActions | null>(null)
const todayRecord = ref<AttendanceTodayData | null>(null)
const todayLabel = ref('')
let refreshTimer: ReturnType<typeof setTimeout> | undefined
let unmounted = false
let fetching = false
let stateVersion = 0

async function loadToday() {
  if (fetching || unmounted) return
  clearTimeout(refreshTimer)
  if (submitting.value || gpsLoading.value) {
    refreshTimer = setTimeout(() => { void loadToday() }, 1000)
    return
  }
  const version = stateVersion
  fetching = true
  try {
    const res = await fetchAttendanceSummary()
    if (unmounted || version !== stateVersion) return
    if (!res.data.attendance_actions) throw new Error('Attendance actions unavailable')
    todayRecord.value = res.data.today
    actions.value = res.data.attendance_actions
    todayLabel.value = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    loadFailed.value = false
  } catch {
    if (unmounted || version !== stateVersion) return
    actions.value = null
    loadFailed.value = true
  } finally {
    fetching = false
    if (!unmounted) {
      loadingToday.value = false
      const seconds = version !== stateVersion ? 1 : Math.max(1, Math.min(60, actions.value?.refresh_after_seconds ?? 60))
      refreshTimer = setTimeout(() => { void loadToday() }, seconds * 1000)
    }
  }
}

async function handleAction(action: 'clock_in' | 'clock_out') {
  if (submitting.value || gpsLoading.value || actions.value?.available_action !== action) return
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
  stateVersion++
  clearTimeout(refreshTimer)
  actions.value = null
  try {
    const res = action === 'clock_in' ? await clockIn(coords) : await clockOut(coords)
    notify.success(res.message)
    emit('clocked')
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    submitting.value = false
    await loadToday()
  }
}

function refreshOnFocus() {
  if (!document.hidden && !submitting.value && !gpsLoading.value) void loadToday()
}

onMounted(() => {
  void loadToday()
  window.addEventListener('focus', refreshOnFocus)
  document.addEventListener('visibilitychange', refreshOnFocus)
})
onUnmounted(() => {
  unmounted = true
  clearTimeout(refreshTimer)
  window.removeEventListener('focus', refreshOnFocus)
  document.removeEventListener('visibilitychange', refreshOnFocus)
})
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
      <div v-if="loadFailed" class="space-y-3">
        <p class="text-sm text-slate-500">Unable to load attendance. Please try again.</p>
        <BaseButton @click="loadToday">Retry</BaseButton>
      </div>

      <template v-else>
        <div
          v-if="actions"
          class="flex items-center gap-3 p-4 rounded-lg border mb-4"
          :class="actions.complete ? 'bg-green-50 border-green-100 text-green-800' : 'bg-blue-50 border-blue-100 text-blue-800'"
        >
          <CheckCircle2 v-if="actions.complete" class="w-5 h-5 shrink-0" />
          <Clock v-else class="w-5 h-5 shrink-0" />
          <div class="text-sm">
            <p class="font-medium">{{ actions.message }}</p>
            <p v-if="todayRecord?.clock_in_time" class="mt-0.5">
              Clock in: {{ formatAttendanceTime(todayRecord.clock_in_time) }}
            </p>
            <p v-if="todayRecord?.clock_out_time" class="mt-0.5">
              Clock out: {{ formatAttendanceTime(todayRecord.clock_out_time) }}
            </p>
          </div>
        </div>

        <BaseButton
          v-if="actions?.available_action"
          type="primary"
          :loading="gpsLoading || submitting"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700"
          @click="handleAction(actions.available_action)"
        >
          <MapPin v-if="!gpsLoading && !submitting" class="w-4 h-4 mr-1.5" />
          {{ gpsLoading ? 'Getting location…' : actions.available_action === 'clock_in' ? 'Clock In' : 'Clock Out' }}
        </BaseButton>
        <p v-if="submitting" class="text-sm text-slate-500">Recording attendance…</p>
      </template>
    </div>
  </div>
</template>
