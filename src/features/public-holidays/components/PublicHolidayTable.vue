<script setup lang="ts">
import { Pencil, Ban, CalendarDays, Plus } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { PublicHoliday } from '../types/public-holiday'

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

      <el-table :data="holidays" class="w-full" :header-cell-style="headerCellStyle">

        <el-table-column label="Holiday Date" width="160">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-900">{{ formatDate(row.holiday_date) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Name" min-width="200">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-800">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Description" min-width="240">
          <template #default="{ row }">
            <span class="text-sm text-slate-400">{{ row.description ?? '—' }}</span>
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
                  class="p-1.5 rounded-md hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-600"
                  @click="emit('edit', row)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="can('public_holidays.delete') && row.status === 'active'"
                content="Disable"
                placement="top"
              >
                <button
                  class="p-1.5 rounded-md hover:bg-red-50 transition-colors text-amber-500 hover:text-red-600"
                  @click="emit('disable', row)"
                >
                  <Ban class="w-4 h-4" />
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
              <CalendarDays class="w-full h-full" stroke-width="1.25" />
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
