<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Banknote, Lock } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { usePayrollDetail } from '../composables/usePayrollDetail'
import { AppCard, BaseButton, StatusBadge, ConfirmDialog } from '@/components/common'
import PayrollItemsTable from './PayrollItemsTable.vue'
import RejectPayrollDialog from './RejectPayrollDialog.vue'
import type { UpdatePayrollItemPayload } from '../types/payroll'

const route = useRoute()
const router = useRouter()
const { can } = usePermission()

const {
  payroll,
  loading,
  actionLoading,
  saveLoading,
  loadPayroll,
  handleSave,
  handleSubmit,
  handleApprove,
  handleReject,
} = usePayrollDetail()

const editMode = ref(false)
const submitConfirmOpen = ref(false)
const approveConfirmOpen = ref(false)
const rejectDialogOpen = ref(false)

const payrollId = computed(() => Number(route.params.id))

const isLocked = computed(() => payroll.value?.status === 'approved')
const canEdit = computed(() => can('payrolls.update') && !isLocked.value)
const canSubmit = computed(() => can('payrolls.submit') && payroll.value?.status === 'draft')
const canApprove = computed(() => can('payrolls.approve') && payroll.value?.status === 'pending_approval')
const canReject = computed(() => can('payrolls.reject') && payroll.value?.status === 'pending_approval')

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatMonth(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month)
}

function formatMoney(value: string | undefined): string {
  if (!value) return '—'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(() => loadPayroll(payrollId.value))

async function onSave(items: UpdatePayrollItemPayload[]) {
  const ok = await handleSave(payrollId.value, { items })
  if (ok) editMode.value = false
}

async function confirmSubmit() {
  const ok = await handleSubmit(payrollId.value)
  if (ok) submitConfirmOpen.value = false
}

async function confirmApprove() {
  const ok = await handleApprove(payrollId.value)
  if (ok) approveConfirmOpen.value = false
}

async function confirmReject(reason: string) {
  const ok = await handleReject(payrollId.value, { rejection_reason: reason })
  if (ok) rejectDialogOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back + header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-lg hover:bg-gray-100 text-slate-500 hover:text-slate-700 transition-colors"
          @click="router.back()"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
            <Banknote class="w-5 h-5 text-emerald-600" />
          </div>
          <div v-if="payroll">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-semibold text-slate-900">
                Payroll — {{ formatMonth(payroll.month) }} {{ payroll.year }}
              </h1>
              <StatusBadge :status="payroll.status" />
              <Lock v-if="isLocked" class="w-4 h-4 text-slate-400" title="Approved payroll is locked" />
            </div>
            <p class="mt-0.5 text-sm text-slate-500">{{ payroll.item_count }} employee(s) included.</p>
          </div>
          <div v-else-if="loading">
            <div class="h-8 w-60 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="payroll" class="flex items-center gap-2">
        <BaseButton
          v-if="canEdit && !editMode"
          @click="editMode = true"
        >
          Edit Items
        </BaseButton>
        <BaseButton
          v-if="editMode"
          @click="editMode = false"
        >
          Cancel Edit
        </BaseButton>
        <BaseButton
          v-if="canSubmit"
          type="primary"
          class="!bg-amber-500 !border-amber-500 hover:!bg-amber-600"
          :loading="actionLoading"
          @click="submitConfirmOpen = true"
        >
          Submit for Approval
        </BaseButton>
        <BaseButton
          v-if="canApprove"
          type="primary"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          :loading="actionLoading"
          @click="approveConfirmOpen = true"
        >
          Approve
        </BaseButton>
        <BaseButton
          v-if="canReject"
          type="danger"
          :loading="actionLoading"
          @click="rejectDialogOpen = true"
        >
          Reject
        </BaseButton>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="h-32 bg-gray-100 rounded-xl animate-pulse" />
      <div class="h-64 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <template v-else-if="payroll">
      <!-- Rejection reason -->
      <div
        v-if="payroll.rejection_reason"
        class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700"
      >
        <p class="font-semibold mb-1">Rejection Reason</p>
        <p>{{ payroll.rejection_reason }}</p>
      </div>

      <!-- Totals summary -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Gross Salary</p>
          <p class="text-lg font-semibold text-slate-800">{{ formatMoney(payroll.totals?.gross_salary) }}</p>
        </AppCard>
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Unpaid Deduction</p>
          <p class="text-lg font-semibold text-red-600">{{ formatMoney(payroll.totals?.unpaid_deduction) }}</p>
        </AppCard>
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Absence Deduction</p>
          <p class="text-lg font-semibold text-red-600">{{ formatMoney(payroll.totals?.absence_deduction) }}</p>
        </AppCard>
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Tax Amount</p>
          <p class="text-lg font-semibold text-amber-600">{{ formatMoney(payroll.totals?.tax_amount) }}</p>
        </AppCard>
        <AppCard>
          <p class="text-xs text-slate-400 mb-1">Net Salary</p>
          <p class="text-lg font-semibold text-emerald-600">{{ formatMoney(payroll.totals?.net_salary) }}</p>
        </AppCard>
      </div>

      <!-- Approved locked notice -->
      <div
        v-if="isLocked"
        class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700 flex items-center gap-2"
      >
        <Lock class="w-4 h-4 shrink-0" />
        This payroll batch has been approved and is now locked. No further edits are allowed.
      </div>

      <!-- Items table -->
      <AppCard no-padding>
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">Payroll Items</h3>
            <p class="text-xs text-slate-400 mt-0.5">Individual employee payroll breakdown.</p>
          </div>
          <span class="text-xs text-slate-400 font-medium">{{ payroll.items?.length ?? 0 }} items</span>
        </div>

        <PayrollItemsTable
          :items="payroll.items ?? []"
          :editable="editMode && canEdit"
          :save-loading="saveLoading"
          @save="onSave"
        />
      </AppCard>
    </template>

    <div v-else class="text-center py-20 text-slate-400 text-sm">Payroll not found.</div>

    <!-- Submit confirm -->
    <ConfirmDialog
      v-model="submitConfirmOpen"
      title="Submit Payroll"
      message="Are you sure you want to submit this payroll for CEO approval? After submission, editing will be restricted until it is rejected."
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
      message="Are you sure you want to approve this payroll batch? Payslips will become visible to employees and the batch will be locked."
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
