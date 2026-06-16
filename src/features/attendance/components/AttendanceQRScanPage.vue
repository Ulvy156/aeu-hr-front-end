<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle, XCircle, LogIn, LogOut, Clock, AlertCircle } from '@lucide/vue'
import { scanQRCode } from '../services/attendance.api'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type { QRScanResult } from '../types/attendance'

type PageState = 'loading' | 'success' | 'error'

const route = useRoute()

const state = ref<PageState>('loading')
const result = ref<QRScanResult | null>(null)
const errorMessage = ref('')

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) {
    errorMessage.value = 'Invalid QR code. No token found in the URL.'
    state.value = 'error'
    return
  }
  try {
    const res = await scanQRCode({ token })
    result.value = res.data
    state.value = 'success'
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err)
    state.value = 'error'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">

      <!-- Brand header -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4 text-white">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <span class="text-base font-semibold text-slate-900">HR System</span>
      </div>

      <!-- Card -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-8">

        <!-- Loading -->
        <div v-if="state === 'loading'" class="flex flex-col items-center gap-4 py-4">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div class="text-center">
            <p class="text-base font-semibold text-slate-900">Processing attendance…</p>
            <p class="text-sm text-slate-500 mt-1">Please wait a moment.</p>
          </div>
        </div>

        <!-- Success -->
        <div v-else-if="state === 'success' && result" class="flex flex-col items-center gap-5">

          <!-- Clock in -->
          <template v-if="result.action === 'qr_clock_in'">
            <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle class="w-9 h-9 text-emerald-600" />
            </div>
            <div class="text-center">
              <p class="text-xl font-semibold text-slate-900">Clocked In!</p>
              <p class="text-sm text-slate-500 mt-1">Your clock-in has been recorded.</p>
            </div>
          </template>

          <!-- Clock out -->
          <template v-else>
            <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <CheckCircle class="w-9 h-9 text-blue-600" />
            </div>
            <div class="text-center">
              <p class="text-xl font-semibold text-slate-900">Clocked Out!</p>
              <p class="text-sm text-slate-500 mt-1">Your clock-out has been recorded.</p>
            </div>
          </template>

          <!-- Detail rows -->
          <div class="w-full rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">

            <!-- Action -->
            <div class="flex items-center justify-between px-4 py-3">
              <div class="flex items-center gap-2 text-slate-500 text-sm">
                <component
                  :is="result.action === 'qr_clock_in' ? LogIn : LogOut"
                  class="w-4 h-4"
                />
                Action
              </div>
              <span class="text-sm font-medium text-slate-900">
                {{ result.action === 'qr_clock_in' ? 'Clock In' : 'Clock Out' }}
              </span>
            </div>

            <!-- Time -->
            <div class="flex items-center justify-between px-4 py-3">
              <div class="flex items-center gap-2 text-slate-500 text-sm">
                <Clock class="w-4 h-4" />
                Time
              </div>
              <span class="text-sm font-medium text-slate-900">
                {{
                  result.action === 'qr_clock_in'
                    ? formatTime(result.attendance.clock_in_time)
                    : formatTime(result.attendance.clock_out_time)
                }}
              </span>
            </div>

            <!-- Late badge (clock-in only) -->
            <div
              v-if="result.action === 'qr_clock_in'"
              class="flex items-center justify-between px-4 py-3"
            >
              <div class="flex items-center gap-2 text-slate-500 text-sm">
                <AlertCircle class="w-4 h-4" />
                Status
              </div>
              <span
                v-if="result.attendance.is_late"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100"
              >
                Late
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-100"
              >
                On Time
              </span>
            </div>
          </div>

          <p class="text-xs text-slate-400 text-center">
            You may close this page.
          </p>
        </div>

        <!-- Error -->
        <div v-else-if="state === 'error'" class="flex flex-col items-center gap-5">
          <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle class="w-9 h-9 text-red-500" />
          </div>
          <div class="text-center">
            <p class="text-xl font-semibold text-slate-900">Scan Failed</p>
            <p class="text-sm text-slate-600 mt-2">{{ errorMessage }}</p>
          </div>
          <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700 text-center w-full">
            If this problem persists, please contact HR for assistance.
          </div>
        </div>

      </div>

      <p class="mt-5 text-center text-xs text-slate-400">HR Management System — Internal use only.</p>
    </div>
  </div>
</template>
