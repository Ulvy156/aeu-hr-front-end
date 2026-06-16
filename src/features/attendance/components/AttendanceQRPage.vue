<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { QrCode, Download, RefreshCw, Info } from '@lucide/vue'
import { useAttendanceQR } from '../composables/useAttendanceQR'

const { token, loading, generating, deleting, downloading, load, generate, download, regenerate } =
  useAttendanceQR()

const scanUrl = computed(() => token.value?.scan_url ?? '')
const qrDataUrl = useQRCode(scanUrl, { width: 260, margin: 2 })

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(load)
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div class="flex items-start gap-3">
        <div class="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <QrCode class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">QR Attendance</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            Generate and manage the office QR code for employee clock-in and clock-out.
          </p>
        </div>
      </div>
    </div>

    <!-- Info note -->
    <div class="flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50 p-3.5 text-sm text-blue-700">
      <Info class="w-4 h-4 shrink-0 mt-0.5" />
      <p>
        Print and post this QR code outside the office. Employees scan it with their phone camera to
        clock in or out automatically. The QR code stays valid until you delete it.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl shadow-sm p-12 flex justify-center">
      <div class="flex flex-col items-center gap-3 text-slate-400">
        <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-sm">Loading QR code...</p>
      </div>
    </div>

    <!-- No token: empty state -->
    <div
      v-else-if="!token"
      class="bg-white border border-gray-200 rounded-xl shadow-sm p-12 flex flex-col items-center gap-4"
    >
      <div class="h-16 w-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <QrCode class="w-8 h-8" />
      </div>
      <div class="text-center">
        <p class="text-base font-semibold text-slate-900">No QR code yet</p>
        <p class="text-sm text-slate-500 mt-1">
          Generate a QR code to enable QR-based attendance for your employees.
        </p>
      </div>
      <el-button
        type="primary"
        :loading="generating"
        size="large"
        @click="generate"
      >
        <QrCode class="w-4 h-4 mr-2" />
        Generate QR Code
      </el-button>
    </div>

    <!-- Token exists: QR display -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- QR image card -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center gap-5">
        <div class="flex items-center gap-2 self-start">
          <div class="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <QrCode class="w-4 h-4" />
          </div>
          <p class="text-sm font-semibold text-slate-900">Office QR Code</p>
        </div>

        <div class="border border-gray-200 rounded-xl p-3 bg-white">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="Attendance QR Code"
            class="w-56 h-56 block"
          />
          <div
            v-else
            class="w-56 h-56 bg-gray-50 flex items-center justify-center rounded-lg"
          >
            <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        <p class="text-xs text-slate-400 text-center max-w-xs">
          Print this QR code and post it at the office entrance.
        </p>

        <!-- Actions -->
        <div class="flex flex-col gap-2 w-full">
          <el-button
            type="primary"
            :loading="downloading"
            class="w-full"
            @click="download"
          >
            <Download class="w-4 h-4 mr-2" />
            Download PNG
          </el-button>
          <el-button
            :loading="deleting || generating"
            class="w-full"
            @click="regenerate"
          >
            <RefreshCw class="w-4 h-4 mr-2" />
            Delete &amp; Regenerate
          </el-button>
        </div>
      </div>

      <!-- Token details card -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
            <Info class="w-4 h-4" />
          </div>
          <p class="text-sm font-semibold text-slate-900">Token Details</p>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Generated By</p>
            <p class="text-sm font-medium text-slate-900">{{ token.generated_by.name }}</p>
            <p class="text-xs text-slate-500">{{ token.generated_by.email }}</p>
          </div>

          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Created At</p>
            <p class="text-sm text-slate-700">{{ formatDate(token.created_at) }}</p>
          </div>

          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Status</p>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-100">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Active
            </span>
          </div>

          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Scan URL</p>
            <p class="text-xs text-slate-500 break-all font-mono bg-gray-50 rounded-lg p-2 border border-gray-100">
              {{ token.scan_url }}
            </p>
          </div>
        </div>

        <div class="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
          <strong>Lost or stolen?</strong> Use "Delete &amp; Regenerate" to invalidate the current
          QR code and print a new one. The old QR will stop working immediately.
        </div>
      </div>
    </div>
  </div>
</template>
