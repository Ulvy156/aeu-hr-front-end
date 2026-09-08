<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart2 } from '@lucide/vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { usePermission } from '@/composables/usePermissions'
import { useDashboard } from '@/composables/useDashboard'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { ConfirmDialog } from '@/components/common'
import RejectPayrollDialog from '@/features/payroll/components/RejectPayrollDialog.vue'
import {
  approvePayroll,
  rejectPayroll,
} from '@/features/payroll/services/payroll.api'
import { getCeoDashboard } from '../services/dashboard.api'
import type { CeoDashboardData, DashboardPayrollBatch } from '../types/dashboard'
import { formatDashboardLongDate, formatDashboardMonth } from '../utils/dashboardDisplay'
import CeoPayrollApproval from './CeoPayrollApproval.vue'
import CeoPendingLeavesCard from './CeoPendingLeavesCard.vue'

const router = useRouter()
const auth = useAuthStore()
const { can, hasRole } = usePermission()
const notify = useNotify()
const { data, loading, error, load } = useDashboard<CeoDashboardData>(getCeoDashboard)

const actionLoading = ref(false)
const approveConfirmOpen = ref(false)
const rejectDialogOpen = ref(false)
const selectedBatch = ref<DashboardPayrollBatch | null>(null)

onMounted(load)

const isGmOnly = computed(() => hasRole('gm') && !hasRole('ceo'))
const canApprovePayroll = computed(() => can('payrolls.approve'))
const canRejectPayroll = computed(() => can('payrolls.reject'))
const canApproveLeave = computed(() => can('leaves.approve_ceo') || can('leaves.approve_hr'))

const actionCount = computed(() => {
  if (!data.value) return 0
  let count = 0
  if (canApprovePayroll.value) count += data.value.payroll_approval_summary.pending_approval_count
  if (canApproveLeave.value) count += data.value.pending_leave_approvals.total
  return count
})

function openApprove(batch: DashboardPayrollBatch) {
  selectedBatch.value = batch
  approveConfirmOpen.value = true
}

function openReject(batch: DashboardPayrollBatch) {
  selectedBatch.value = batch
  rejectDialogOpen.value = true
}

function viewBatch(batch: DashboardPayrollBatch) {
  router.push({ name: 'payroll-detail', params: { id: batch.id } })
}

async function confirmApprove() {
  if (!selectedBatch.value) return
  actionLoading.value = true
  try {
    await approvePayroll(selectedBatch.value.id)
    notify.success('Payroll approved successfully.')
    approveConfirmOpen.value = false
    await load()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    actionLoading.value = false
  }
}

async function confirmReject(reason: string) {
  if (!selectedBatch.value) return
  actionLoading.value = true
  try {
    await rejectPayroll(selectedBatch.value.id, { rejection_reason: reason })
    notify.success('Payroll rejected.')
    rejectDialogOpen.value = false
    await load()
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
          <BarChart2 class="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ isGmOnly ? 'GM Dashboard' : 'CEO Dashboard' }}
          </h1>
          <p class="mt-0.5 text-sm text-slate-500">
            Welcome back,
            <span class="font-medium text-slate-700">{{ auth.user?.name }}</span>. Approvals for
            {{ formatDashboardLongDate(data?.date) }}.
          </p>
        </div>
      </div>
      <span
        v-if="actionCount > 0"
        class="shrink-0 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
      >
        {{ actionCount }} actions
      </span>
    </div>

    <div v-if="loading" class="grid gap-5 lg:grid-cols-2">
      <div v-for="i in 2" :key="i" class="h-48 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
      <button class="ml-3 text-red-600 underline" @click="load">Retry</button>
    </div>

    <template v-else-if="data">
      <div class="grid items-start gap-5 lg:grid-cols-2">
        <CeoPayrollApproval
          v-if="canApprovePayroll"
          :pending-count="data.payroll_approval_summary.pending_approval_count"
          :latest-batch="data.payroll_approval_summary.latest_pending_approval_batch"
          :recent-batches="data.payroll_approval_summary.recent_pending_batches"
          :can-approve="canApprovePayroll"
          :can-reject="canRejectPayroll"
          :action-loading="actionLoading"
          @approve="openApprove"
          @reject="openReject"
          @view="viewBatch"
        />

        <CeoPendingLeavesCard
          v-if="canApproveLeave"
          :section="data.pending_leave_approvals"
        />
      </div>
    </template>

    <ConfirmDialog
      v-model="approveConfirmOpen"
      title="Approve payroll"
      :message="
        selectedBatch
          ? `Approve ${formatDashboardMonth(selectedBatch.month, selectedBatch.year)}? Payslips will become available after approval.`
          : 'Approve this payroll batch?'
      "
      confirm-text="Approve"
      :loading="actionLoading"
      @confirm="confirmApprove"
    />

    <RejectPayrollDialog
      v-model:visible="rejectDialogOpen"
      :loading="actionLoading"
      @reject="confirmReject"
    />
  </div>
</template>
