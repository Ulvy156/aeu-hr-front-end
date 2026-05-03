<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Clock, CheckCircle2, MapPin } from '@lucide/vue'
import { clockIn, clockOut, fetchAttendance } from '../services/attendance.api'
import type { Attendance } from '../types/attendance'
import { usePermission } from '@/composables/usePermissions'
import { useNotify } from '@/composables/useNotify'
import { getCurrentLocation } from '@/utils/getCurrentLocation'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { BaseButton } from '@/components/common'

const emit = defineEmits<{ clocked: [] }>()

const { can } = usePermission()
const notify = useNotify()
const gpsLoading = ref(false)
const submitting = ref(false)
const loadingToday = ref(true)
const todayRecord = ref<Attendance | null>(null)

const today = new Date().toISOString().split('T')[0]
const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const hasClockedIn = computed(() => !!todayRecord.value?.clock_in_time)
const hasClockedOut = computed(() => !!todayRecord.value?.clock_out_time)
const isComplete = computed(() => hasClockedIn.value && hasClockedOut.value)

function fmt(isoStr: string | null): string {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

async function loadToday() {
  loadingToday.value = true
  try {
    const res = await fetchAttendance({ attendance_date: today, per_page: 1 })
    todayRecord.value = res.data[0] ?? null
  } catch {
    // silent — user can still try to clock in/out
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
    // error already shown by getCurrentLocation via useNotify
    gpsLoading.value = false
    return
  }
  gpsLoading.value = false

  submitting.value = true
  try {
    const res = action === 'clock-in' ? await clockIn(coords) : await clockOut(coords)
    todayRecord.value = res.data
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

    <!-- Loading skeleton -->
    <div v-if="loadingToday" class="space-y-3">
      <el-skeleton :rows="2" animated />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Completed state -->
      <div v-if="isComplete" class="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100 mb-4">
        <CheckCircle2 class="w-5 h-5 text-green-600 shrink-0" />
        <div class="text-sm">
          <p class="font-medium text-green-800">Attendance complete for today</p>
          <p class="text-green-600 mt-0.5">
            Clock in: {{ fmt(todayRecord!.clock_in_time) }} · Clock out: {{ fmt(todayRecord!.clock_out_time) }}
          </p>
        </div>
      </div>

      <!-- Partial: clocked in only -->
      <div v-else-if="hasClockedIn" class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
        <Clock class="w-4 h-4 text-blue-600 shrink-0" />
        <div class="text-sm">
          <p class="font-medium text-blue-800">Clocked in at {{ fmt(todayRecord!.clock_in_time) }}</p>
          <p class="text-blue-500 mt-0.5">Don't forget to clock out when you leave.</p>
        </div>
      </div>

      <!-- Action buttons -->
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
