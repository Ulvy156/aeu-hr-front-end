<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Banknote } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { usePayrolls } from '../composables/usePayrolls'
import { AppCard, BaseButton, ConfirmDialog } from '@/components/common'
import PayrollFilters from './PayrollFilters.vue'
import PayrollTable from './PayrollTable.vue'
import GeneratePayrollDialog from './GeneratePayrollDialog.vue'
import RejectPayrollDialog from './RejectPayrollDialog.vue'
import type { PayrollBatch } from '../types/payroll'

const { can } = usePermission()
const {
  payrolls,
  meta,
  loading,
  actionLoading,
  loadPayrolls,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  handleGenerate,
  handleSubmit,
  handleApprove,
  handleReject,
} = usePayrolls()

const generateOpen = ref(false)
const submitConfirmOpen = ref(false)
const approveConfirmOpen = ref(false)
const rejectDialogOpen = ref(false)
const selectedPayroll = ref<PayrollBatch | null>(null)

const canGenerate = computed(() => can('payrolls.generate'))

onMounted(loadPayrolls)

function openSubmitConfirm(payroll: PayrollBatch) {
  selectedPayroll.value = payroll
  submitConfirmOpen.value = true
}

function openApproveConfirm(payroll: PayrollBatch) {
  selectedPayroll.value = payroll
  approveConfirmOpen.value = true
}

function openRejectDialog(payroll: PayrollBatch) {
  selectedPayroll.value = payroll
  rejectDialogOpen.value = true
}

async function confirmGenerate(month: number, year: number) {
  const ok = await handleGenerate({ month, year })
  if (ok) generateOpen.value = false
}

async function confirmSubmit() {
  if (!selectedPayroll.value) return
  const ok = await handleSubmit(selectedPayroll.value.id)
  if (ok) submitConfirmOpen.value = false
}

async function confirmApprove() {
  if (!selectedPayroll.value) return
  const ok = await handleApprove(selectedPayroll.value.id)
  if (ok) approveConfirmOpen.value = false
}

async function confirmReject(reason: string) {
  if (!selectedPayroll.value) return
  const ok = await handleReject(selectedPayroll.value.id, { rejection_reason: reason })
  if (ok) rejectDialogOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
          <Banknote class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Payroll</h1>
          <p class="mt-0.5 text-sm text-slate-500">Generate and manage monthly payroll batches.</p>
        </div>
      </div>
      <BaseButton
        v-if="canGenerate"
        type="primary"
        class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
        @click="generateOpen = true"
      >
        + Generate Payroll
      </BaseButton>
    </div>

    <!-- Filters -->
    <PayrollFilters @apply="applyFilters" />

    <!-- Table card -->
    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Payroll Batches</h3>
          <p class="text-xs text-slate-400 mt-0.5">All payroll batches you have access to view.</p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
      </div>

      <PayrollTable
        :payrolls="payrolls"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @submit="openSubmitConfirm"
        @approve="openApproveConfirm"
        @reject="openRejectDialog"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <!-- Generate dialog -->
    <GeneratePayrollDialog
      v-model:visible="generateOpen"
      :loading="actionLoading"
      @generate="confirmGenerate"
    />

    <!-- Submit confirm -->
    <ConfirmDialog
      v-model="submitConfirmOpen"
      title="Submit Payroll"
      message="Are you sure you want to submit this payroll batch for CEO approval? After submission, editing will be restricted."
      confirm-text="Submit"
      type="info"
      :loading="actionLoading"
      @confirm="confirmSubmit"
      @cancel="submitConfirmOpen = false"
    />

    <!-- Approve confirm -->
    <ConfirmDialog
      v-model="approveConfirmOpen"
      title="Approve Payroll"
      message="Are you sure you want to approve this payroll batch? Approved payroll will be locked and payslips will become visible to employees."
      confirm-text="Approve"
      type="info"
      :loading="actionLoading"
      @confirm="confirmApprove"
      @cancel="approveConfirmOpen = false"
    />

    <!-- Reject dialog -->
    <RejectPayrollDialog
      v-model:visible="rejectDialogOpen"
      :loading="actionLoading"
      @reject="confirmReject"
    />
  </div>
</template>
