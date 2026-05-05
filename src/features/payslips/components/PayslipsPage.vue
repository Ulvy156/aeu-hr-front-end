<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText } from '@lucide/vue'
import { usePayslips } from '../composables/usePayslips'
import { AppCard } from '@/components/common'
import PayslipFilters from './PayslipFilters.vue'
import PayslipTable from './PayslipTable.vue'
import PayslipDetailDrawer from './PayslipDetailDrawer.vue'
import type { Payslip } from '../types/payslip'

const {
  payslips,
  meta,
  loading,
  selectedPayslip,
  detailLoading,
  downloadLoading,
  loadPayslips,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  loadPayslipDetail,
  handleDownload,
} = usePayslips()

const drawerOpen = ref(false)

onMounted(loadPayslips)

async function handleView(payslip: Payslip) {
  drawerOpen.value = true
  await loadPayslipDetail(payslip.id)
}

async function handleDownloadFromTable(payslip: Payslip) {
  await handleDownload(payslip.id)
}

async function handleDownloadFromDrawer(payslip: Payslip) {
  await handleDownload(payslip.id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
          <FileText class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Payslips</h1>
          <p class="mt-0.5 text-sm text-slate-500">View and download approved employee payslips.</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <PayslipFilters @apply="applyFilters" />

    <!-- Info note for employees -->
    <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
      Only approved payslips are visible. Payslips are generated after payroll is approved by management.
    </div>

    <!-- Table card -->
    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Payslips</h3>
          <p class="text-xs text-slate-400 mt-0.5">All payslips you have access to view.</p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
      </div>

      <PayslipTable
        :payslips="payslips"
        :loading="loading"
        :download-loading="downloadLoading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @view="handleView"
        @download="handleDownloadFromTable"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <!-- Detail drawer -->
    <PayslipDetailDrawer
      v-model:visible="drawerOpen"
      :payslip="selectedPayslip"
      :detail-loading="detailLoading"
      :download-loading="selectedPayslip ? downloadLoading[selectedPayslip.id] : false"
      @download="handleDownloadFromDrawer"
    />
  </div>
</template>
