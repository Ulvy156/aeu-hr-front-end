<script setup lang="ts">
import { computed } from 'vue'
import { Paperclip } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { StatusBadge, BaseButton } from '@/components/common'
import { buildUpgradeDiff } from '../utils/buildUpgradeDiff'
import type { EmployeeUpgradeRequest } from '../types/employee-upgrade-request'

const props = defineProps<{
  visible: boolean
  request: EmployeeUpgradeRequest | null
  loading?: boolean
  actionLoading?: boolean
  departments: { id: number; name: string }[]
  positions: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  approve: [request: EmployeeUpgradeRequest]
  reject: [request: EmployeeUpgradeRequest]
  cancel: [request: EmployeeUpgradeRequest]
}>()

const { can } = usePermission()
const auth = useAuthStore()

const diffRows = computed(() => {
  if (!props.request) return []
  return buildUpgradeDiff(props.request.current_values, props.request.proposed_values, props.departments, props.positions)
})

const canApprove = computed(() => {
  const r = props.request
  return !!r && r.status === 'pending' && can('employee_upgrade_requests.approve')
})

const canReject = computed(() => {
  const r = props.request
  return !!r && r.status === 'pending' && can('employee_upgrade_requests.reject')
})

const canCancel = computed(() => {
  const r = props.request
  return (
    !!r &&
    r.status === 'pending' &&
    can('employee_upgrade_requests.cancel') &&
    r.requested_by.id === auth.user?.id
  )
})

const hasActions = computed(() => canApprove.value || canReject.value || canCancel.value)

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="Upgrade Request Detail"
    direction="rtl"
    size="520px"
    :before-close="() => emit('update:visible', false)"
    destroy-on-close
  >
    <div v-if="loading" class="flex items-center justify-center py-20 text-slate-400 text-sm">
      Loading request detail...
    </div>

    <div v-else-if="request" class="space-y-5">
      <!-- Header -->
      <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-slate-900">{{ request.employee.full_name }}</h3>
            <p class="text-xs text-slate-500 font-mono">{{ request.employee.employee_id }}</p>
          </div>
          <StatusBadge :status="request.status" />
        </div>
      </div>

      <!-- Rejection reason -->
      <div
        v-if="request.status === 'rejected' && request.rejection_reason"
        class="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700"
      >
        <p class="font-medium mb-1">Rejection Reason</p>
        <p>{{ request.rejection_reason }}</p>
      </div>

      <!-- Proposed changes -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Proposed Changes</h4>
        <div v-if="diffRows.length" class="space-y-2">
          <div v-for="row in diffRows" :key="row.field" class="text-sm">
            <span class="text-slate-500">{{ row.label }}: </span>
            <span class="text-slate-700">{{ row.before }}</span>
            <span class="text-slate-400"> → </span>
            <span class="font-medium text-slate-900">{{ row.after }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-slate-400">No field changes recorded.</p>
      </div>

      <!-- Attachments -->
      <div v-if="request.attachments.length" class="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Attachments</h4>
        <div class="space-y-1.5">
          <a
            v-for="(file, idx) in request.attachments"
            :key="idx"
            :href="file.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Paperclip class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ file.name }}</span>
          </a>
        </div>
      </div>

      <!-- Workflow info -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Info</h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Requested By</p>
            <p class="font-medium text-slate-800">{{ request.requested_by?.name ?? '—' }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Created At</p>
            <p class="font-medium text-slate-800">{{ formatDateTime(request.created_at) }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Effective Date</p>
            <p class="font-medium text-slate-800">{{ formatDate(request.effective_date) }}</p>
          </div>
          <div v-if="request.reviewed_by">
            <p class="text-slate-400 text-xs mb-0.5">Reviewed By</p>
            <p class="font-medium text-slate-800">{{ request.reviewed_by.name }}</p>
          </div>
          <div v-if="request.reviewed_at">
            <p class="text-slate-400 text-xs mb-0.5">Reviewed At</p>
            <p class="font-medium text-slate-800">{{ formatDateTime(request.reviewed_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="hasActions" class="flex flex-wrap gap-2 pt-2">
        <BaseButton
          v-if="canApprove"
          type="primary"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          :loading="actionLoading"
          @click="emit('approve', request)"
        >
          Approve
        </BaseButton>
        <BaseButton
          v-if="canReject"
          type="danger"
          :loading="actionLoading"
          @click="emit('reject', request)"
        >
          Reject
        </BaseButton>
        <BaseButton
          v-if="canCancel"
          :loading="actionLoading"
          @click="emit('cancel', request)"
        >
          Cancel Request
        </BaseButton>
      </div>
    </div>

    <div v-else class="flex items-center justify-center py-20 text-slate-400 text-sm">
      No request selected.
    </div>
  </el-drawer>
</template>
