<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { BaseSelect, EmptyState, BasePagination } from '@/components/common'
import { useEmploymentHistory } from '../composables/useEmploymentHistory'
import type {
  EmploymentHistoryEntry,
  EmploymentHistoryField,
  EmploymentHistoryValue,
} from '../types/employment-history'

const props = defineProps<{
  employeeId: number
}>()

const { entries, meta, loading, filters, loadHistory, onFieldChange, onPageChange } = useEmploymentHistory()

const fieldLabels: Record<EmploymentHistoryField, string> = {
  department_id: 'Department',
  position_id: 'Position',
  base_salary: 'Base Salary',
  employment_status: 'Employment Status',
  probation_end_date: 'Probation End Date',
}

const fieldOptions = Object.entries(fieldLabels).map(([value, label]) => ({ label, value }))

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatValue(field: EmploymentHistoryField, value: EmploymentHistoryValue): string {
  if (value === null) return '—'

  if ('id' in value) {
    return value.name ?? `#${value.id}`
  }

  if (value.value === null) return '—'

  if (field === 'base_salary') {
    return Number(value.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (field === 'employment_status') {
    const status = String(value.value)
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (field === 'probation_end_date') {
    return formatDate(String(value.value))
  }

  return String(value.value)
}

onMounted(() => {
  loadHistory(props.employeeId)
})

watch(() => props.employeeId, (id) => {
  filters.page = 1
  loadHistory(id)
})
</script>

<template>
  <div class="space-y-4">
    <BaseSelect
      :model-value="filters.field"
      :options="fieldOptions"
      placeholder="All Fields"
      clearable
      class="!w-[220px]"
      @update:model-value="(v) => onFieldChange((v ?? '') as EmploymentHistoryField | '')"
    />

    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-b-xl"
      >
        <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <el-table :data="entries" class="w-full">
        <el-table-column label="Field" min-width="140">
          <template #default="{ row }: { row: EmploymentHistoryEntry }">
            <span class="text-sm font-medium text-slate-800">{{ fieldLabels[row.field] }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Change" min-width="220">
          <template #default="{ row }: { row: EmploymentHistoryEntry }">
            <span class="text-sm text-slate-600">
              {{ formatValue(row.field, row.old_value) }}
              <span class="text-slate-400"> → </span>
              <span class="font-medium text-slate-900">{{ formatValue(row.field, row.new_value) }}</span>
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Effective Date" width="130">
          <template #default="{ row }: { row: EmploymentHistoryEntry }">
            <span class="text-sm text-slate-500">{{ formatDate(row.effective_date) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Changed By" width="140">
          <template #default="{ row }: { row: EmploymentHistoryEntry }">
            <span class="text-sm text-slate-600">{{ row.changed_by?.name ?? '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Recorded At" width="150">
          <template #default="{ row }: { row: EmploymentHistoryEntry }">
            <span class="text-sm text-slate-500">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState
            title="No employment history"
            description="Career changes recorded from approved upgrade requests will appear here."
          />
        </template>
      </el-table>
    </div>

    <BasePagination
      :current-page="meta.current_page"
      :page-size="meta.per_page"
      :total="meta.total"
      @update:current-page="onPageChange"
    />
  </div>
</template>
