<script setup lang="ts">
import { computed } from 'vue'
import { Eye, CheckCircle, XCircle, Ban } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { Leave } from '../types/leave'

defineProps<{
  leaves: Leave[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [leave: Leave]
  approve: [leave: Leave]
  reject: [leave: Leave]
  cancel: [leave: Leave]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()
const auth = useAuthStore()

const canApprove = computed(() => can('leaves.approve') || can('leaves.approve_hr') || can('leaves.approve_ceo'))
const canReject = computed(() => can('leaves.reject') || can('leaves.reject_hr') || can('leaves.reject_ceo'))

function isOwnLeave(leave: Leave): boolean {
  return leave.employee.id === auth.user?.employee?.id
}

function canCancelLeave(leave: Leave): boolean {
  return leave.status === 'pending' && isOwnLeave(leave) && can('leaves.cancel')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

function formatDurationType(type: string): string {
  return type === 'full_day' ? 'Full Day' : 'Half Day'
}

const headerCellStyle = {
  background: '#f9fafb',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
}
</script>

<template>
  <div>
    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-b-xl"
      >
        <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <el-table
        :data="leaves"
        class="w-full"
        :header-cell-style="headerCellStyle"
        scroll-bar-always-on
      >
        <el-table-column label="Employee" min-width="160">
          <template #default="{ row }">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ row.employee.full_name }}</p>
              <p class="text-xs text-slate-400">{{ row.employee.employee_id }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Type" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-700">{{ formatLeaveType(row.leave_type) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Duration" min-width="210">
          <template #default="{ row }">
            <div>
              <p class="text-sm text-slate-700">
                {{ formatDate(row.start_date) }} → {{ formatDate(row.end_date) }}
              </p>
              <p class="text-xs text-slate-400">
                {{ formatDurationType(row.duration_type) }} · {{ row.total_days }} days
              </p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="HR" width="100">
          <template #default="{ row }">
            <StatusBadge :status="row.hr_approval_status" />
          </template>
        </el-table-column>

        <el-table-column label="CEO" width="100">
          <template #default="{ row }">
            <StatusBadge :status="row.ceo_approval_status" />
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="130" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip content="View Detail" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-600"
                  @click="emit('view', row)"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canApprove && row.status === 'pending'" content="Approve" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-emerald-50 transition-colors text-slate-400 hover:text-emerald-600"
                  @click="emit('approve', row)"
                >
                  <CheckCircle class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canReject && row.status === 'pending'" content="Reject" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600"
                  @click="emit('reject', row)"
                >
                  <XCircle class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canCancelLeave(row)" content="Cancel" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-amber-50 transition-colors text-slate-400 hover:text-amber-600"
                  @click="emit('cancel', row)"
                >
                  <Ban class="w-4 h-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No leave requests found."
            description="Try adjusting your filters or submit a new leave request."
          />
        </template>
      </el-table>
    </div>

    <BasePagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @update:current-page="emit('page-change', $event)"
      @update:page-size="emit('size-change', $event)"
    />
  </div>
</template>
