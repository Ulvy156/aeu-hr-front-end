<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@lucide/vue'
import { useNotify } from '@/composables/useNotify'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { usePermission } from '@/composables/usePermissions'
import { PageHeader, AppCard, BaseButton, ConfirmDialog } from '@/components/common'
import { fetchDepartments } from '@/features/departments/services/department.api'
import { fetchPositions } from '@/features/positions/services/position.api'
import type { DeptOption, PositionOption } from '@/features/employees/types/employee'
import { useUpgradeRequests } from '../composables/useUpgradeRequests'
import { fetchUpgradeRequest } from '../services/employee-upgrade-request.api'
import UpgradeRequestFilters from './UpgradeRequestFilters.vue'
import UpgradeRequestTable from './UpgradeRequestTable.vue'
import UpgradeRequestSummaryCards from './UpgradeRequestSummaryCards.vue'
import UpgradeRequestDetailDrawer from './UpgradeRequestDetailDrawer.vue'
import RejectUpgradeRequestDialog from './RejectUpgradeRequestDialog.vue'
import RequestUpgradeFormDrawer from './RequestUpgradeFormDrawer.vue'
import type { EmployeeUpgradeRequest } from '../types/employee-upgrade-request'

const { can } = usePermission()
const notify = useNotify()
const {
  requests,
  statusCounts,
  meta,
  loading,
  actionLoading,
  filters,
  loadRequests,
  applyFilters,
  onPageChange,
  onPageSizeChange,
  handleApprove,
  handleReject,
  handleCancel,
} = useUpgradeRequests()

const drawerOpen = ref(false)
const formOpen = ref(false)
const detailLoading = ref(false)
const selectedRequest = ref<EmployeeUpgradeRequest | null>(null)
const departments = ref<DeptOption[]>([])
const positions = ref<PositionOption[]>([])

const approveConfirmOpen = ref(false)
const rejectDialogOpen = ref(false)
const cancelConfirmOpen = ref(false)

const canCreate = computed(() => can('employee_upgrade_requests.create'))
const subtitle = computed(() =>
  can('employee_upgrade_requests.view_any')
    ? 'Review transfers, promotions, salary, and status changes that need sign-off.'
    : 'Track the promotion requests you have submitted.',
)

onMounted(async () => {
  await loadRequests()
  if (!canCreate.value) return
  try {
    const [dRes, pRes] = await Promise.all([
      fetchDepartments({ per_page: 100 }),
      fetchPositions({ per_page: 100 }),
    ])
    departments.value = dRes.data.map((d) => ({ id: d.id, name: d.name }))
    positions.value = pRes.data.map((p) => ({
      id: p.id,
      name: p.name,
      department_id: p.department?.id ?? null,
      job_level: p.job_level,
    }))
  } catch {
    // non-critical — the form can still open without option lists
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
    drawerOpen.value = false
  }
}

async function confirmReject(reason: string) {
  if (!selectedRequest.value) return
  const ok = await handleReject(selectedRequest.value.id, { rejection_reason: reason })
  if (ok) {
    rejectDialogOpen.value = false
    drawerOpen.value = false
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
    <PageHeader title="Promotion Requests" :subtitle="subtitle">
      <template #action>
        <BaseButton v-if="canCreate" type="primary" @click="formOpen = true">
          <Plus class="mr-1.5 h-4 w-4" />
          New request
        </BaseButton>
      </template>
    </PageHeader>

    <UpgradeRequestSummaryCards
      :counts="statusCounts"
      :loading="loading && requests.length === 0"
    />

    <AppCard no-padding>
      <div class="border-b border-gray-100 px-5 py-4">
        <UpgradeRequestFilters
          :employee-id="filters.employee_id"
          :status="filters.status"
          :counts="statusCounts"
          @apply="applyFilters"
        />
      </div>

      <div class="flex items-center justify-between px-5 py-3">
        <p class="text-sm text-slate-500">
          {{ meta.total }} {{ meta.total === 1 ? 'request' : 'requests' }}
        </p>
        <p class="text-xs text-slate-400">Row click opens detail</p>
      </div>

      <UpgradeRequestTable
        :requests="requests"
        :loading="loading"
        :current-page="meta.current_page"
        :page-size="meta.per_page"
        :total="meta.total"
        @view="handleView"
        @page-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </AppCard>

    <RequestUpgradeFormDrawer
      v-model:visible="formOpen"
      :employee="null"
      :departments="departments"
      :positions="positions"
      @created="loadRequests"
    />

    <UpgradeRequestDetailDrawer
      v-model:visible="drawerOpen"
      :request="selectedRequest"
      :loading="detailLoading"
      :action-loading="actionLoading"
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
