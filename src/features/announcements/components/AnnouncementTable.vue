<script setup lang="ts">
import { Eye } from '@lucide/vue'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { Announcement } from '../types/announcement'

defineProps<{
  announcements: Announcement[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [announcement: Announcement]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
        :data="announcements"
        class="w-full"
        :header-cell-style="headerCellStyle"
        scroll-bar-always-on
      >
        <el-table-column label="Title" min-width="220">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-900">{{ row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Category" width="160">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.category?.name ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Priority" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.priority" />
          </template>
        </el-table-column>

        <el-table-column label="Status" width="140">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Created By" width="160">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.creator?.name ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Created At" width="170">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDateTime(row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="90" fixed="right" align="center">
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
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No announcements found"
            description="Try adjusting your filters or create a new announcement."
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
