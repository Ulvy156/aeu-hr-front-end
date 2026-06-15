<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { usePermission } from '@/composables/usePermissions'
import { PageHeader, AppCard, ConfirmDialog } from '@/components/common'
import { fetchDepartments } from '@/features/departments/services/department.api'
import { fetchPositions } from '@/features/positions/services/position.api'
import { useUpgradeRequests } from '../composables/useUpgradeRequests'
import { fetchUpgradeRequest } from '../services/employee-upgrade-request.api'
import UpgradeRequestFilters from './UpgradeRequestFilters.vue'
import UpgradeRequestTable from './UpgradeRequestTable.vue'
import UpgradeRequestDetailDrawer from './UpgradeRequestDetailDrawer.vue'
import RejectUpgradeRequestDialog from './RejectUpgradeRequestDialog.vue'
import type { EmployeeUpgradeRequest } from '../types/employee-upgrade-request'

const { can } = usePermission()
const notify = useNotify()
const {
  requests,
  meta,
  loading,
  actionLoading,
  loadRequests,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  handleApprove,
  handleReject,
  handleCancel,
} = useUpgradeRequests()

const departments = ref<{ id: number; name: string }[]>([])
const positions = ref<{ id: number; name: string }[]>([])

const drawerOpen = ref(false)
const detailLoading = ref(false)
const selectedRequest = ref<EmployeeUpgradeRequest | null>(null)

const approveConfirmOpen = ref(false)
const rejectDialogOpen = ref(false)
const cancelConfirmOpen = ref(false)

const subtitle = computed(() =>
  can('employee_upgrade_requests.view_any')
    ? 'Review and action transfer, promotion, salary, and status change requests.'
    : 'Track the upgrade requests you have submitted.',
)

onMounted(async () => {
  await loadRequests()
  try {
    const [dRes, pRes] = await Promise.all([
      fetchDepartments({ per_page: 100 }),
      fetchPositions({ per_page: 100 }),
    ])
    departments.value = dRes.data.map((d) => ({ id: d.id, name: d.name }))
    positions.value = pRes.data.map((p) => ({ id: p.id, name: p.name }))
  } catch {
    // non-critical, used only for resolving names in the diff display
  }
})

async function handleView(request: EmployeeUpgradeRequest) {
  selectedRequest.value = request
  drawerOpen.value = true
  detailLoading.value = true
  try {
    const res = await fetchUpgradeRequest(request.id)
    selectedRequest.value = res.data
  } catch (err) {
    notify.error(getApiErrorMessage(err))
  } finally {
    detailLoading.value = false
  }
}

async function refreshDetail() {
  if (!selectedRequest.value) return
  try {
    const res = await fetchUpgradeRequest(selectedRequest.value.id)
    selectedRequest.value = res.data
  } catch {
    // ignore refresh errors, list will still reflect latest state
  }
}

function openApproveConfirm() {
  approveConfirmOpen.value = true
}

function openRejectDialog() {
  rejectDialogOpen.value = true
}

function openCancelConfirm() {
  cancelConfirmOpen.value = true
}

async function confirmApprove() {
  if (!selectedRequest.value) return
  const ok = await handleApprove(selectedRequest.value.id)
  if (ok) {
    approveConfirmOpen.value = false
    await refreshDetail()
  }
}

async function confirmReject(reason: string) {
  if (!selectedRequest.value) return
  const ok = await handleReject(selectedRequest.value.id, { rejection_reason: reason })
  if (ok) {
    rejectDialogOpen.value = false
    await refreshDetail()
  }
}

async function confirmCancel() {
  if (!selectedRequest.value) return
  const ok = await handleCancel(selectedRequest.value.id)
  if (ok) {
    cancelConfirmOpen.value = false
    await refreshDetail()
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Employee Upgrade Requests"
      :subtitle="subtitle"
    />

    <UpgradeRequestFilters @apply="applyFilters" />

    <AppCard no-padding>
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Requests</h3>
          <p class="text-xs text-slate-400 mt-0.5">Transfers, promotions, salary, and status changes.</p>
        </div>
        <span class="text-xs text-slate-400 font-medium">{{ meta.total }} records</span>
      </div>

      <UpgradeRequestTable
        :requests="requests"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        :departments="departments"
        :positions="positions"
        @view="handleView"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <UpgradeRequestDetailDrawer
      v-model:visible="drawerOpen"
      :request="selectedRequest"
      :loading="detailLoading"
      :action-loading="actionLoading"
      :departments="departments"
      :positions="positions"
      @approve="openApproveConfirm"
      @reject="openRejectDialog"
      @cancel="openCancelConfirm"
    />

    <ConfirmDialog
      v-model="approveConfirmOpen"
      title="Approve Upgrade Request"
      message="Are you sure you want to approve this request? The employee record will be updated and the change will be recorded in their employment history."
      confirm-text="Approve"
      type="info"
      :loading="actionLoading"
      @confirm="confirmApprove"
      @cancel="approveConfirmOpen = false"
    />

    <RejectUpgradeRequestDialog
      v-model:visible="rejectDialogOpen"
      :loading="actionLoading"
      @reject="confirmReject"
    />

    <ConfirmDialog
      v-model="cancelConfirmOpen"
      title="Cancel Upgrade Request"
      message="Are you sure you want to cancel this request? You will need to submit a new request to propose these changes again."
      confirm-text="Cancel Request"
      type="warning"
      :loading="actionLoading"
      @confirm="confirmCancel"
      @cancel="cancelConfirmOpen = false"
    />
  </div>
</template>
