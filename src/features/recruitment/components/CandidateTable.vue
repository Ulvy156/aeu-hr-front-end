<script setup lang="ts">
import { Pencil, RefreshCw, FileText } from '@lucide/vue'
import type { Candidate } from '../types/candidate'
import { StatusBadge, EmptyState, BasePagination } from '@/components/common'
import { usePermission } from '@/composables/usePermissions'

withDefaults(
  defineProps<{
    candidates: Candidate[]
    loading: boolean
    currentPage: number
    pageSize: number
    total: number
    showVacancyColumn?: boolean
  }>(),
  {
    showVacancyColumn: true,
  },
)

const emit = defineEmits<{
  edit: [candidate: Candidate]
  'status-change': [candidate: Candidate]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { can } = usePermission()

const sourceLabels: Record<string, string> = {
  facebook: 'Facebook',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
  referral: 'Referral',
  walk_in: 'Walk-in',
  email: 'Email',
  other: 'Other',
}

function formatDate(value: string | null): string {
  if (!value) return '—'
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

      <el-table :data="candidates" class="w-full">
        <el-table-column label="Name" min-width="180">
          <template #default="{ row }">
            <span class="text-sm font-medium text-slate-900">{{ row.full_name }}</span>
            <p class="text-xs text-slate-400">{{ row.phone }}</p>
          </template>
        </el-table-column>

        <el-table-column v-if="showVacancyColumn" label="Vacancy" min-width="160">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ row.vacancy?.title ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Source" width="110">
          <template #default="{ row }">
            <span class="text-sm text-slate-600">{{ sourceLabels[row.source] ?? row.source }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="170">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="Interview Date" width="140">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ formatDate(row.interview_date) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Interviewer(s)" min-width="160">
          <template #default="{ row }">
            <span v-if="!row.interviewers?.length" class="text-sm text-slate-400">No interviewer assigned</span>
            <div v-else class="flex flex-wrap gap-1">
              <el-tag v-for="i in row.interviewers" :key="i.id" size="small" type="info" effect="plain">
                {{ i.full_name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="CV" width="70" align="center">
          <template #default="{ row }">
            <a
              v-if="row.cv"
              :href="row.cv.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center text-slate-500 hover:text-emerald-600"
            >
              <FileText class="w-4 h-4" />
            </a>
            <span v-else class="text-sm text-slate-300">—</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip
                v-if="can('recruitment.candidates.update') && row.status !== 'hired'"
                content="Edit"
                placement="top"
              >
                <button
                  class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-emerald-600"
                  @click="emit('edit', row)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
              </el-tooltip>

              <el-tooltip
                v-if="can('recruitment.candidates.update') && row.status !== 'hired'"
                content="Change Status"
                placement="top"
              >
                <button
                  class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-slate-500 hover:text-blue-600"
                  @click="emit('status-change', row)"
                >
                  <RefreshCw class="w-4 h-4" />
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState title="No candidates found" description="Try adjusting your search or filters." />
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
