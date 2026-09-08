<script setup lang="ts">
import { Eye } from '@lucide/vue'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import type { EmployeeUpgradeRequest } from '../types/employee-upgrade-request'
import {
  formatUpgradeDate,
  relativeEffectiveLabel,
  upgradeChangeChips,
  upgradeChangeHeadline,
} from '../utils/upgradeRequestDisplay'

defineProps<{
  requests: EmployeeUpgradeRequest[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [request: EmployeeUpgradeRequest]
  'page-change': [page: number]
  'size-change': [size: number]
}>()
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
        :data="requests"
        class="w-full"
        @row-click="(row: EmployeeUpgradeRequest) => emit('view', row)"
      >
        <el-table-column label="Employee" min-width="180">
          <template #default="{ row }">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-900">
                {{ row.employee.full_name }}
              </p>
              <p class="font-mono text-xs text-slate-500">{{ row.employee.employee_id }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Proposed change" min-width="260">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="chip in upgradeChangeChips(row)"
                :key="chip"
                class="inline-flex rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {{ chip }}
              </span>
            </div>
            <p
              class="mt-1 max-w-md truncate text-sm text-slate-600"
              :title="upgradeChangeHeadline(row)"
            >
              {{ upgradeChangeHeadline(row) }}
            </p>
          </template>
        </el-table-column>

        <el-table-column label="Effective" width="140">
          <template #default="{ row }">
            <p class="text-sm text-slate-600">{{ formatUpgradeDate(row.effective_date) }}</p>
            <p class="text-xs text-slate-400">{{ relativeEffectiveLabel(row.effective_date) }}</p>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Requested by" min-width="140">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.requested_by?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center" @click.stop>
              <el-tooltip
                :content="row.status === 'pending' ? 'Review' : 'View Detail'"
                placement="top"
              >
                <button
                  class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  @click="emit('view', row)"
                >
                  <Eye class="h-4 w-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No promotion requests found"
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
