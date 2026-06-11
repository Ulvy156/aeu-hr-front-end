<script setup lang="ts">
import { Pencil, CircleX } from '@lucide/vue'
import type { Vacancy } from '../types/vacancy'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'

defineProps<{
  vacancies: Vacancy[]
  loading: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  view: [vacancy: Vacancy]
  edit: [vacancy: Vacancy]
  close: [vacancy: Vacancy]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
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

      <el-table :data="vacancies" class="w-full" @row-click="(row: Vacancy) => emit('view', row)">
        <el-table-column label="Title" min-width="200">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-900 cursor-pointer hover:text-emerald-600">{{ row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Department" min-width="160">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.department?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Headcount" width="120" align="center">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.filled_headcount }} / {{ row.required_headcount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Target Hiring Date" width="170">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDate(row.target_hiring_date) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1" @click.stop>
              <el-tooltip v-if="can('recruitment.vacancies.update')" content="Edit" placement="top">
                <button
                  class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-emerald-600"
                  @click="emit('edit', row)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="row.status === 'open' && can('recruitment.vacancies.close')"
                content="Close Vacancy"
                placement="top"
              >
                <button
                  class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-red-600"
                  @click="emit('close', row)"
                >
                  <CircleX class="w-4 h-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState title="No vacancies found" description="Try adjusting your search or filters." />
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
