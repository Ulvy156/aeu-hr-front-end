<script setup lang="ts">
import { computed } from 'vue'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { StatusBadge, BaseButton } from '@/components/common'
import type { Leave } from '../types/leave'

const props = defineProps<{
  visible: boolean
  leave: Leave | null
  actionLoading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  approve: [leave: Leave]
  reject: [leave: Leave]
  cancel: [leave: Leave]
}>()

const { can } = usePermission()
const auth = useAuthStore()

const canApprove = computed(() => can('leaves.approve') || can('leaves.approve_hr') || can('leaves.approve_ceo'))
const canReject = computed(() => can('leaves.reject') || can('leaves.reject_hr') || can('leaves.reject_ceo'))

const isOwnLeave = computed(() => {
  if (!props.leave || !auth.user?.employee?.id) return false
  return props.leave.employee.id === auth.user.employee.id
})

const canCancel = computed(() =>
  props.leave?.status === 'pending' && isOwnLeave.value && can('leaves.cancel'),
)

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const leaveTypeLabels: Record<string, string> = {
  annual: 'Annual',
  sick: 'Sick',
  special: 'Special',
  special_sick: 'Special Sick',
  maternity: 'Maternity',
  unpaid: 'Unpaid',
}

function formatLeaveType(type: string): string {
  return leaveTypeLabels[type] ?? type
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="Leave Request Detail"
    direction="rtl"
    size="480px"
    :before-close="() => emit('update:visible', false)"
    destroy-on-close
  >
    <div v-if="leave" class="space-y-5">
      <!-- Employee info -->
      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
          {{ leave.employee.full_name.charAt(0) }}
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">{{ leave.employee.full_name }}</p>
          <p class="text-xs text-slate-400">{{ leave.employee.employee_id }}</p>
        </div>
        <div class="ml-auto">
          <StatusBadge :status="leave.status" />
        </div>
      </div>

      <!-- Leave details -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Leave Details</h4>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Leave Type</p>
            <p class="font-medium text-slate-800">{{ formatLeaveType(leave.leave_type) }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Duration Type</p>
            <p class="font-medium text-slate-800">
              {{ leave.duration_type === 'full_day' ? 'Full Day' : 'Half Day' }}
            </p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Start Date</p>
            <p class="font-medium text-slate-800">{{ formatDate(leave.start_date) }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">End Date</p>
            <p class="font-medium text-slate-800">{{ formatDate(leave.end_date) }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Total Days</p>
            <p class="font-semibold text-slate-900">{{ leave.total_days }} days</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Submitted</p>
            <p class="font-medium text-slate-800">{{ formatDateTime(leave.created_at) }}</p>
          </div>
        </div>

        <div>
          <p class="text-slate-400 text-xs mb-0.5">Reason</p>
          <p class="text-sm text-slate-700 leading-relaxed">{{ leave.reason }}</p>
        </div>
      </div>

      <!-- Approval status -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Approval Track</h4>

        <div class="flex items-center justify-between py-2 border-b border-gray-50">
          <div>
            <p class="text-sm font-medium text-slate-700">HR Approval</p>
            <p v-if="leave.hr_approved_by_user" class="text-xs text-slate-400">
              by {{ leave.hr_approved_by_user.name }}
            </p>
          </div>
          <StatusBadge :status="leave.hr_approval_status" />
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <p class="text-sm font-medium text-slate-700">CEO Approval</p>
            <p v-if="leave.ceo_approved_by_user" class="text-xs text-slate-400">
              by {{ leave.ceo_approved_by_user.name }}
            </p>
          </div>
          <StatusBadge :status="leave.ceo_approval_status" />
        </div>
      </div>

      <!-- Rejection reason -->
      <div
        v-if="leave.rejection_reason"
        class="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700"
      >
        <p class="font-medium mb-1">Rejection Reason</p>
        <p>{{ leave.rejection_reason }}</p>
      </div>

      <!-- Cancelled at -->
      <div
        v-if="leave.cancelled_at"
        class="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600"
      >
        Cancelled on {{ formatDateTime(leave.cancelled_at) }}
      </div>

      <!-- Actions -->
      <div
        v-if="canApprove || canReject || canCancel"
        class="flex flex-wrap gap-2 pt-2"
      >
        <BaseButton
          v-if="canApprove && leave.status === 'pending'"
          type="primary"
          :loading="actionLoading"
          class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
          @click="emit('approve', leave)"
        >
          Approve
        </BaseButton>
        <BaseButton
          v-if="canReject && leave.status === 'pending'"
          type="danger"
          :loading="actionLoading"
          @click="emit('reject', leave)"
        >
          Reject
        </BaseButton>
        <BaseButton
          v-if="canCancel"
          :loading="actionLoading"
          @click="emit('cancel', leave)"
        >
          Cancel Request
        </BaseButton>
      </div>
    </div>

    <div v-else class="flex items-center justify-center py-20 text-slate-400 text-sm">
      No leave selected.
    </div>
  </el-drawer>
</template>
