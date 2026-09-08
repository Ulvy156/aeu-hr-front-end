<script setup lang="ts">
import { Download, FileText, Loader2 } from '@lucide/vue'
import { AppCard, BaseButton } from '@/components/common'
import type { LatestPayslip } from '../types/dashboard'
import { formatDashboardMoney, formatDashboardMonth } from '../utils/dashboardDisplay'

defineProps<{
  payslip: LatestPayslip | null
  canDownload: boolean
  downloadLoading?: boolean
}>()

const emit = defineEmits<{
  download: []
}>()
</script>

<template>
  <AppCard>
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <FileText class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">Latest payslip</p>
          <p class="text-xs text-slate-400">Most recent approved payslip</p>
        </div>
      </div>
      <BaseButton
        v-if="payslip && canDownload"
        :disabled="downloadLoading"
        @click="emit('download')"
      >
        <Loader2 v-if="downloadLoading" class="mr-1.5 h-4 w-4 animate-spin" />
        <Download v-else class="mr-1.5 h-4 w-4" />
        {{ downloadLoading ? 'Downloading…' : 'Download PDF' }}
      </BaseButton>
    </div>

    <div v-if="payslip" class="space-y-4">
      <p class="text-sm font-semibold text-slate-700">
        {{ formatDashboardMonth(payslip.payroll_batch.month, payslip.payroll_batch.year) }}
      </p>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <p class="mb-0.5 text-xs text-slate-400">Gross</p>
          <p class="font-medium text-slate-800">{{ formatDashboardMoney(payslip.gross_salary) }}</p>
        </div>
        <div>
          <p class="mb-0.5 text-xs text-slate-400">Tax</p>
          <p class="font-medium text-amber-600">{{ formatDashboardMoney(payslip.tax_amount) }}</p>
        </div>
        <div>
          <p class="mb-0.5 text-xs text-slate-400">Net</p>
          <p class="text-lg font-bold text-emerald-700">
            {{ formatDashboardMoney(payslip.net_salary) }}
          </p>
        </div>
      </div>
      <p class="text-xs text-slate-400">
        Amounts come from the approved payroll item — frontend does not recalculate.
      </p>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-8 text-center">
      <FileText class="mb-3 h-10 w-10 text-slate-200" />
      <p class="text-sm font-medium text-slate-600">No payslip yet</p>
      <p class="mt-1 text-xs text-slate-400">Approved payslips will appear here.</p>
    </div>
  </AppCard>
</template>
