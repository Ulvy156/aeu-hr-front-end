<script setup lang="ts">
import { Pencil, UserCheck } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { StatusBadge, EmptyState, BasePagination, BaseButton } from '@/components/common'
import type { Attendance } from '../types/attendance'
import { ATTENDANCE_STATUS_LABELS } from '../types/attendance'
import {
  formatAttendanceDate,
  formatAttendanceTime,
  formatAttendanceWeekday,
} from '../utils/formatAttendance'

const props = defineProps<{
  attendances: Attendance[]
  loading: boolean
  canViewAny: boolean
  selectedId: number | null
  currentPage: number
  pageSize: number
  total: number
  emptyTitle: string
  emptyDescription: string
}>()

const emit = defineEmits<{
  select: [attendance: Attendance]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()
const auth = useAuthStore()

const headerCellStyle = {
  background: '#f9fafb',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
}

function rowClassName({ row }: { row: Attendance }): string {
  return row.id === props.selectedId ? 'correction-row-active' : ''
}

function statusLabel(status: Attendance['status']): string {
  return ATTENDANCE_STATUS_LABELS[status]
}
</script>

<template>
  <div>
    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-white/70"
      >
        <div class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>

      <el-table
        :data="attendances"
        class="w-full"
        :header-cell-style="headerCellStyle"
        :row-class-name="rowClassName"
        @row-click="(row: Attendance) => emit('select', row)"
      >
        <el-table-column label="Date" min-width="140">
          <template #default="{ row }">
            <div>
              <p class="text-sm font-semibold text-slate-900">
                {{ formatAttendanceDate(row.attendance_date) }}
              </p>
              <p class="text-xs text-slate-400">{{ formatAttendanceWeekday(row.attendance_date) }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column v-if="canViewAny" label="Employee" min-width="180">
          <template #default="{ row }">
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ row.employee.full_name }}</p>
              <p class="text-xs text-slate-400">{{ row.employee.employee_id }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Times" min-width="160">
          <template #default="{ row }">
            <p class="text-sm font-medium text-slate-800">In {{ formatAttendanceTime(row.clock_in_time) }}</p>
            <p class="text-xs text-slate-500">Out {{ formatAttendanceTime(row.clock_out_time) }}</p>
            <p
              v-if="row.proxied_clock_in_by_user || row.proxied_clock_out_by_user"
              class="mt-0.5 flex items-center gap-1 text-xs text-slate-400"
            >
              <UserCheck class="h-3 w-3 shrink-0" />
              <span class="truncate">
                {{
                  [
                    row.proxied_clock_in_by_user ? `In by ${row.proxied_clock_in_by_user.name}` : null,
                    row.proxied_clock_out_by_user ? `Out by ${row.proxied_clock_out_by_user.name}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                }}
              </span>
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Status" min-width="140">
          <template #default="{ row }">
            <StatusBadge
              :status="row.status"
              :custom-label="statusLabel(row.status)"
            />
            <p v-if="row.is_late && row.status !== 'late'" class="mt-1 text-xs text-amber-600">
              Late flag
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Correction" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-if="row.corrected_by_user"
              type="success"
              size="small"
              round
              disable-transitions
            >
              Corrected
            </el-tag>
            <p v-else class="text-xs text-slate-400">Original</p>
            <p
              v-if="row.correction_reason"
              class="mt-1 max-w-[180px] truncate text-xs text-slate-500"
              :title="row.correction_reason"
            >
              {{ row.correction_reason }}
            </p>
          </template>
        </el-table-column>

        <el-table-column v-if="can('attendance.correct')" label="" width="110" align="right" fixed="right">
          <template #default="{ row }">
            <BaseButton
              v-if="auth.user?.employee?.id !== row.employee.id"
              size="small"
              :type="selectedId === row.id ? 'primary' : 'default'"
              :icon="Pencil"
              @click.stop="emit('select', row)"
            >
              {{ selectedId === row.id ? 'Editing' : 'Correct' }}
            </BaseButton>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState :title="emptyTitle" :description="emptyDescription" />
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

<style scoped>
:deep(.correction-row-active td) {
  background-color: #ecfdf5 !important;
}
</style>
