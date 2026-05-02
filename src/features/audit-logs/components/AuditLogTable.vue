<script setup lang="ts">
import { Eye } from '@lucide/vue'
import type { AuditLog } from '../types/audit-log'
import { EmptyState, BasePagination } from '@/components/common'

defineProps<{
  logs: AuditLog[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [log: AuditLog]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortModelType(type: string | null): string {
  if (!type) return '—'
  return type.split('\\').pop() ?? type
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

      <el-table :data="logs" class="w-full">
        <el-table-column label="Date / Time" width="170">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ formatDateTime(row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="User" min-width="140">
          <template #default="{ row }">
            <div v-if="row.user">
              <p class="text-sm font-medium text-slate-900">{{ row.user.name }}</p>
              <p class="text-xs text-slate-400">{{ row.user.email }}</p>
            </div>
            <span v-else class="text-sm text-slate-400">System</span>
          </template>
        </el-table-column>

        <el-table-column label="Module" width="130">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" type="info">{{ row.module }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Action" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" type="primary">{{ row.action }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Model Type" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ shortModelType(row.model_type) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Model ID" width="90" align="center">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ row.model_id ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="IP Address" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-500 font-mono">{{ row.ip_address ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="" width="60" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip content="View Detail" placement="top">
              <button
                class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-emerald-600"
                @click="emit('view', row)"
              >
                <Eye class="w-4 h-4" />
              </button>
            </el-tooltip>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No audit logs found"
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
