<script setup lang="ts">
import { Eye } from '@lucide/vue'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import { buildUpgradeDiff } from '../utils/buildUpgradeDiff'
import type { EmployeeUpgradeRequest } from '../types/employee-upgrade-request'

const props = defineProps<{
  requests: EmployeeUpgradeRequest[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
  departments: { id: number; name: string }[]
  positions: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  view: [request: EmployeeUpgradeRequest]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function summarize(request: EmployeeUpgradeRequest): string {
  const rows = buildUpgradeDiff(request.current_values, request.proposed_values, props.departments, props.positions)
  return rows.map((r) => `${r.label}: ${r.before} → ${r.after}`).join(', ')
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

      <el-table :data="requests" class="w-full">
        <el-table-column label="Employee" min-width="180">
          <template #default="{ row }">
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ row.employee.full_name }}</p>
              <p class="text-xs text-slate-500 font-mono">{{ row.employee.employee_id }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Requested Changes" min-width="280">
          <template #default="{ row }">
            <p class="text-sm text-slate-600 max-w-md truncate" :title="summarize(row)">
              {{ summarize(row) }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Requested By" width="150">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.requested_by?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Effective Date" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDate(row.effective_date) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Created" width="130">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip content="View Detail" placement="top">
              <button
                class="p-1.5 rounded-md hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-600"
                @click="emit('view', row)"
              >
                <Eye class="w-4 h-4" />
              </button>
            </el-tooltip>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No upgrade requests found"
            description="Try adjusting your filters."
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
