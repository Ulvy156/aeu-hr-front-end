<script setup lang="ts">
import { Pencil, CircleX } from '@lucide/vue'
import type { Vacancy } from '../types/vacancy'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'
import VacancyHiringBar from './VacancyHiringBar.vue'
import { formatVacancyDate, isVacancyOverdue, relativeTargetLabel } from '../utils/vacancyDisplay'

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

      <el-table :data="vacancies" class="w-full" @row-click="(row: Vacancy) => emit('view', row)">
        <el-table-column label="Vacancy" min-width="220">
          <template #default="{ row }">
            <div>
              <span
                class="cursor-pointer text-sm font-medium text-slate-900 hover:text-emerald-600"
              >
                {{ row.title }}
              </span>
              <p class="text-xs text-slate-500">{{ row.department?.name ?? '—' }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Hiring" min-width="180">
          <template #default="{ row }">
            <VacancyHiringBar :filled="row.filled_headcount" :required="row.required_headcount" />
          </template>
        </el-table-column>

        <el-table-column label="Listing / Close date" min-width="170">
          <template #default="{ row }">
            <p class="text-sm text-slate-600">{{ formatVacancyDate(row.target_hiring_date) }}</p>
            <p v-if="row.close_date" class="text-xs text-slate-500">Closes {{ formatVacancyDate(row.close_date) }}</p>
            <span
              v-if="isVacancyOverdue(row)"
              class="mt-0.5 inline-flex rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700"
            >
              Overdue
            </span>
            <p v-else class="text-xs text-slate-400">{{ relativeTargetLabel(row) }}</p>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Posted by" min-width="140">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.creator?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1" @click.stop>
              <el-tooltip v-if="can('recruitment.vacancies.update')" content="Edit" placement="top">
                <button
                  class="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-gray-100 hover:text-emerald-600"
                  @click="emit('edit', row)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="row.status === 'open' && can('recruitment.vacancies.close')"
                content="Close Vacancy"
                placement="top"
              >
                <button
                  class="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-gray-100 hover:text-red-600"
                  @click="emit('close', row)"
                >
                  <CircleX class="h-4 w-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No vacancies found"
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
