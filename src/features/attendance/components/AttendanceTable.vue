<script setup lang="ts">
import { Pencil, UserCheck, ClockCheck } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { Attendance } from '../types/attendance'

defineProps<{
  attendances: Attendance[]
  loading: boolean
  canViewAny: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  correct: [attendance: Attendance]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()

const headerCellStyle = {
  background: '#f9fafb',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function fmtTime(isoStr: string | null): string {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const statusLabelMap: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  missing_clock_out: 'Missing Clock-out',
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

      <el-table :data="attendances" class="w-full" :header-cell-style="headerCellStyle">
        <el-table-column label="Date" >
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-900">{{ fmtDate(row.attendance_date) }}</span>
          </template>
        </el-table-column>

        <el-table-column v-if="canViewAny" label="Employee" >
          <template #default="{ row }">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ row.employee.full_name }}</p>
              <p class="text-xs text-slate-400">{{ row.employee.employee_id }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Clock In">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5">
              <span class="text-sm text-slate-700">{{ fmtTime(row.clock_in_time) }}</span>
              <el-tooltip
                v-if="row.proxied_clock_in_by_user"
                :content="`Clocked in by ${row.proxied_clock_in_by_user.name}`"
                placement="top"
              >
                <UserCheck class="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </el-tooltip>
              <!-- proxy clock -->
              <el-tooltip
                v-if="row.corrected_by_user"
                :content="`Proxy clock in by ${row.corrected_by_user.name}`"
                placement="top"
              >
                <ClockCheck class="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Clock Out">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5">
              <span class="text-sm text-slate-700">{{ fmtTime(row.clock_out_time) }}</span>
              <el-tooltip
                v-if="row.proxied_clock_out_by_user"
                :content="`Clocked out by ${row.proxied_clock_out_by_user.name}`"
                placement="top"
              >
                <UserCheck class="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </el-tooltip>
              <!-- proxy clock -->
              <el-tooltip
                v-if="row.corrected_by_user"
                :content="`Proxy clock out by ${row.corrected_by_user.name}`"
                placement="top"
              >
                <ClockCheck class="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" >
          <template #default="{ row }">
            <StatusBadge :status="row.status" :custom-label="statusLabelMap[row.status]" />
          </template>
        </el-table-column>

        <el-table-column label="Late"  align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_late" type="warning" size="small" round disable-transitions>
              Yes
            </el-tag>
            <span v-else class="text-xs text-slate-400">—</span>
          </template>
        </el-table-column>

        <el-table-column v-if="can('attendance.correct')" label="Actions"  fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip content="Correct" placement="top">
              <button
                class="p-1.5 rounded-md hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-600"
                @click="emit('correct', row)"
              >
                <Pencil class="w-4 h-4" />
              </button>
            </el-tooltip>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No attendance records found."
            description="Try adjusting your filters or date range."
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
