<script setup lang="ts">
import { Pencil, Ban, CalendarDays, Plus } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { PublicHoliday } from '../types/public-holiday'
import {
  formatHolidayDate,
  holidayRelativeLabel,
  holidayWeekday,
  isSoonHoliday,
} from '../utils/holidayDisplay'

defineProps<{
  holidays: PublicHoliday[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
  canCreate: boolean
}>()

const emit = defineEmits<{
  edit: [holiday: PublicHoliday]
  disable: [holiday: PublicHoliday]
  create: []
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()

const headerCellStyle = {
  background: '#f9fafb',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
}

function rowClassName({ row }: { row: PublicHoliday }): string {
  if (isSoonHoliday(row)) return 'bg-blue-50/40'
  if (row.status === 'inactive') return 'opacity-80'
  return ''
}
</script>

<template>
  <div>
    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-white/70"
      >
        <div
          class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
        />
      </div>

      <el-table
        :data="holidays"
        class="w-full"
        :header-cell-style="headerCellStyle"
        :row-class-name="rowClassName"
      >
        <el-table-column label="Date" width="180">
          <template #default="{ row }">
            <div class="py-0.5">
              <p class="text-sm font-semibold text-slate-900">
                {{ formatHolidayDate(row.holiday_date) }}
              </p>
              <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span class="text-xs text-slate-500">{{ holidayWeekday(row.holiday_date) }}</span>
                <span
                  v-if="isSoonHoliday(row)"
                  class="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700"
                >
                  {{ holidayRelativeLabel(row.holiday_date) }}
                </span>
                <span v-else class="text-xs text-slate-400">
                  {{ holidayRelativeLabel(row.holiday_date) }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Holiday" min-width="240">
          <template #default="{ row }">
            <div class="min-w-0 py-0.5">
              <p class="truncate text-sm font-semibold text-slate-900">{{ row.name }}</p>
              <p class="mt-0.5 truncate text-xs text-slate-500">
                {{ row.description ?? 'No description' }}
              </p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip v-if="can('public_holidays.update')" content="Edit" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  @click="emit('edit', row)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="can('public_holidays.delete') && row.status === 'active'"
                content="Disable"
                placement="top"
              >
                <button
                  class="rounded-md p-1.5 text-amber-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  @click="emit('disable', row)"
                >
                  <Ban class="h-4 w-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No public holidays found."
            description="Try adjusting your filters or add a new holiday."
            :action-label="canCreate ? 'Add Holiday' : undefined"
            @action="emit('create')"
          >
            <template #icon>
              <CalendarDays class="h-full w-full" stroke-width="1.25" />
            </template>
          </EmptyState>
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
