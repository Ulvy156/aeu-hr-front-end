<script setup lang="ts">
import { Pencil, Ban } from '@lucide/vue'
import type { AnnouncementCategory } from '../types/announcement-category'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'

defineProps<{
  categories: AnnouncementCategory[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  edit: [category: AnnouncementCategory]
  deactivate: [category: AnnouncementCategory]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
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

      <el-table :data="categories" class="w-full">
        <el-table-column label="Name" min-width="180">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-900">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Description" min-width="240">
          <template #default="{ row }">
            <span class="text-sm text-slate-500 line-clamp-1">{{ row.description ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Updated At" width="160">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDate(row.updated_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip v-if="can('announcement_categories.update')" content="Edit" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-emerald-600"
                  @click="emit('edit', row)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="can('announcement_categories.deactivate') && row.status === 'active'"
                content="Deactivate"
                placement="top"
              >
                <button
                  class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-red-600"
                  @click="emit('deactivate', row)"
                >
                  <Ban class="w-4 h-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No announcement categories found"
            description="Try adjusting your search or filters."
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
