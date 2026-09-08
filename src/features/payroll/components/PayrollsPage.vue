<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Banknote, Plus } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { usePayrolls } from '../composables/usePayrolls'
import { AppCard, BaseButton, ConfirmDialog } from '@/components/common'
import { formatPayrollPeriod, needsAttention } from '../utils/payrollDisplay'
import PayrollFilters from './PayrollFilters.vue'
import PayrollTable from './PayrollTable.vue'
import PayrollSummaryCards from './PayrollSummaryCards.vue'
import PayrollCurrentCycle from './PayrollCurrentCycle.vue'
import PayrollNeedsAttention from './PayrollNeedsAttention.vue'
import GeneratePayrollDialog from './GeneratePayrollDialog.vue'
import RejectPayrollDialog from './RejectPayrollDialog.vue'
import type { PayrollBatch } from '../types/payroll'

const router = useRouter()
const { can, hasRole } = usePermission()
const {
  payrolls,
  statusCounts,
  currentCycle,
  lastApproved,
  latestRejected,
  meta,
  loading,
  actionLoading,
  filters,
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
const showDepartmentScopeBanner = computed(
  () => hasRole('head') && !hasRole('hr') && !hasRole('admin') && !hasRole('gm') && !hasRole('ceo'),
)
const showNeedsAttention = computed(() => payrolls.value.some(needsAttention))
const rejectedMessage = computed(() => {
  const batch = latestRejected.value
  if (!batch || statusCounts.value.rejected <= 0) return ''
  const period = formatPayrollPeriod(batch.month, batch.year)
  if (batch.rejection_reason) return `${period} was rejected: ${batch.rejection_reason}`
  return `${period} was rejected.`
})

onMounted(loadPayrolls)

function viewPayroll(payroll: PayrollBatch) {
  router.push({ name: 'payroll-detail', params: { id: payroll.id } })
}

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
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
          <Banknote class="h-5 w-5 text-emerald-600" />
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
        <Plus class="mr-1.5 h-4 w-4" />
        Generate Payroll
      </BaseButton>
    </div>

    <div
      v-if="showDepartmentScopeBanner"
      class="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Totals and payroll items are limited to your department.
    </div>

    <PayrollSummaryCards
      :counts="statusCounts"
      :last-approved="lastApproved"
      :loading="loading && payrolls.length === 0"
    />

    <PayrollCurrentCycle
      v-if="currentCycle"
      :payroll="currentCycle"
      @view="viewPayroll"
      @approve="openApproveConfirm"
      @reject="openRejectDialog"
    />

    <div
      v-if="rejectedMessage"
      class="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700"
    >
      {{ rejectedMessage }} Open the batch to correct items.
    </div>

    <AppCard no-padding>
      <div class="border-b border-gray-100 px-5 py-4">
        <PayrollFilters
          :month="filters.month"
          :year="filters.year"
          :status="filters.status"
          :counts="statusCounts"
          @apply="applyFilters"
        />
      </div>

      <div :class="showNeedsAttention ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_260px]' : ''">
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

        <PayrollNeedsAttention :payrolls="payrolls" @view="viewPayroll" />
      </div>
    </AppCard>

    <GeneratePayrollDialog
      v-model:visible="generateOpen"
      :loading="actionLoading"
      @generate="confirmGenerate"
    />

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

    <RejectPayrollDialog
      v-model:visible="rejectDialogOpen"
      :loading="actionLoading"
      @reject="confirmReject"
    />
  </div>
</template>
