<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CalendarDays } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useLeaves } from '../composables/useLeaves'
import { AppCard, BaseButton, ConfirmDialog } from '@/components/common'
import LeaveFilters from './LeaveFilters.vue'
import LeaveTable from './LeaveTable.vue'
import LeaveCreateDialog from './LeaveCreateDialog.vue'
import LeaveDetailDrawer from './LeaveDetailDrawer.vue'
import RejectLeaveDialog from './RejectLeaveDialog.vue'
import type { Leave } from '../types/leave'

const { can } = usePermission()
const {
  leaves,
  meta,
  loading,
  actionLoading,
  loadLeaves,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  handleApprove,
  handleReject,
  handleCancel,
} = useLeaves()

const createOpen = ref(false)
const drawerOpen = ref(false)
const approveConfirmOpen = ref(false)
const rejectDialogOpen = ref(false)
const cancelConfirmOpen = ref(false)
const selectedLeave = ref<Leave | null>(null)

const canCreate = computed(() => can('leaves.create'))

onMounted(loadLeaves)

function handleViewLeave(leave: Leave) {
  selectedLeave.value = leave
  drawerOpen.value = true
}

function openApproveConfirm(leave: Leave) {
  selectedLeave.value = leave
  approveConfirmOpen.value = true
}

function openRejectDialog(leave: Leave) {
  selectedLeave.value = leave
  rejectDialogOpen.value = true
}

function openCancelConfirm(leave: Leave) {
  selectedLeave.value = leave
  cancelConfirmOpen.value = true
}

async function confirmApprove() {
  if (!selectedLeave.value) return
  const ok = await handleApprove(selectedLeave.value.id)
  if (ok) {
    approveConfirmOpen.value = false
    if (drawerOpen.value) drawerOpen.value = false
  }
}

async function confirmReject(reason: string) {
  if (!selectedLeave.value) return
  const ok = await handleReject(selectedLeave.value.id, { rejection_reason: reason })
  if (ok) {
    rejectDialogOpen.value = false
    if (drawerOpen.value) drawerOpen.value = false
  }
}

async function confirmCancel() {
  if (!selectedLeave.value) return
  const ok = await handleCancel(selectedLeave.value.id)
  if (ok) {
    cancelConfirmOpen.value = false
    if (drawerOpen.value) drawerOpen.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
          <CalendarDays class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Leave Requests</h1>
          <p class="mt-0.5 text-sm text-slate-500">Manage and track employee leave requests.</p>
        </div>
      </div>
      <BaseButton
        v-if="canCreate"
        type="primary"
        class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
        @click="createOpen = true"
      >
        + Request Leave
      </BaseButton>
    </div>

    <!-- Filters -->
    <LeaveFilters @apply="applyFilters" />

    <!-- Table card -->
    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Leave Requests</h3>
          <p class="text-xs text-slate-400 mt-0.5">All leave requests you have access to view.</p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
      </div>

      <LeaveTable
        :leaves="leaves"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @view="handleViewLeave"
        @approve="openApproveConfirm"
        @reject="openRejectDialog"
        @cancel="openCancelConfirm"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <!-- Create dialog -->
    <LeaveCreateDialog
      v-model:visible="createOpen"
      @created="loadLeaves"
    />

    <!-- Detail drawer -->
    <LeaveDetailDrawer
      v-model:visible="drawerOpen"
      :leave="selectedLeave"
      :action-loading="actionLoading"
      @approve="openApproveConfirm"
      @reject="openRejectDialog"
      @cancel="openCancelConfirm"
    />

    <!-- Approve confirm -->
    <ConfirmDialog
      v-model="approveConfirmOpen"
      title="Approve Leave"
      message="Are you sure you want to approve this leave request? This action will be audited."
      confirm-text="Approve"
      type="info"
      :loading="actionLoading"
      @confirm="confirmApprove"
      @cancel="approveConfirmOpen = false"
    />

    <!-- Reject dialog -->
    <RejectLeaveDialog
      v-model:visible="rejectDialogOpen"
      :loading="actionLoading"
      @reject="confirmReject"
    />

    <!-- Cancel confirm -->
    <ConfirmDialog
      v-model="cancelConfirmOpen"
      title="Cancel Leave Request"
      message="Are you sure you want to cancel this leave request? Only pending leave can be cancelled."
      confirm-text="Cancel Request"
      type="warning"
      :loading="actionLoading"
      @confirm="confirmCancel"
      @cancel="cancelConfirmOpen = false"
    />
  </div>
</template>
