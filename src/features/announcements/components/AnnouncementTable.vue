<script setup lang="ts">
import { Archive, CheckCircle, Eye, Send, XCircle } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { Announcement } from '../types/announcement'
import {
  announcementStatusLabel,
  announcementTimeline,
  audienceLabel,
} from '../utils/announcementDisplay'

defineProps<{
  announcements: Announcement[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [announcement: Announcement]
  submit: [announcement: Announcement]
  approve: [announcement: Announcement]
  reject: [announcement: Announcement]
  archive: [announcement: Announcement]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()
const auth = useAuthStore()

function canSubmit(row: Announcement): boolean {
  return (row.status === 'draft' || row.status === 'rejected') && can('announcements.submit')
}

function canApprove(row: Announcement): boolean {
  return (
    row.status === 'pending_approval' &&
    can('announcements.approve') &&
    row.creator?.id !== auth.user?.id
  )
}

function canArchive(row: Announcement): boolean {
  return row.status === 'published' && can('announcements.archive')
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

      <el-table :data="announcements" class="w-full">
        <el-table-column label="Announcement" min-width="240">
          <template #default="{ row }">
            <p class="text-sm font-semibold text-slate-800">{{ row.title }}</p>
            <p class="text-xs text-slate-500">
              {{ row.category?.name ?? 'Uncategorized' }} · {{ announcementTimeline(row) }}
            </p>
            <p
              v-if="row.status === 'rejected' && row.rejection_reason"
              class="mt-0.5 line-clamp-2 text-xs text-slate-500"
            >
              {{ row.rejection_reason }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <StatusBadge :status="row.status" :custom-label="announcementStatusLabel(row.status)" />
          </template>
        </el-table-column>

        <el-table-column label="Audience" width="170">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ audienceLabel(row.targets) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Author" width="150">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.creator?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip content="View Detail" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  @click="emit('view', row)"
                >
                  <Eye class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canSubmit(row)" content="Submit for Approval" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                  @click="emit('submit', row)"
                >
                  <Send class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canApprove(row)" content="Approve" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                  @click="emit('approve', row)"
                >
                  <CheckCircle class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canApprove(row)" content="Reject" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  @click="emit('reject', row)"
                >
                  <XCircle class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip v-if="canArchive(row)" content="Archive" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  @click="emit('archive', row)"
                >
                  <Archive class="h-4 w-4" />
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
