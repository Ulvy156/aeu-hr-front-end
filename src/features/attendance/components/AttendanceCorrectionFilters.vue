<script setup lang="ts">
import { ref, watch } from 'vue'
import { EmployeeSearchSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import type { CorrectionQueue, CorrectionQueueCounts } from '../types/attendance'

const QUEUE_PILLS: { key: CorrectionQueue; label: string }[] = [
  { key: 'needs_review', label: 'Needs review' },
  { key: 'late', label: 'Late' },
  { key: 'absent', label: 'Absent' },
  { key: 'all', label: 'All records' },
]

const props = defineProps<{
  queue: CorrectionQueue
  employeeId: number | null
  dateFrom: string
  dateTo: string
  counts: CorrectionQueueCounts
  canViewAny: boolean
}>()

const emit = defineEmits<{
  'update:queue': [queue: CorrectionQueue]
  apply: [employeeId: number | null, dateFrom: string, dateTo: string]
  reset: []
}>()

const localEmployeeId = ref<number | null>(props.employeeId)
const localDateFrom = ref(props.dateFrom)
const localDateTo = ref(props.dateTo)

watch(
  () => [props.employeeId, props.dateFrom, props.dateTo] as const,
  ([employeeId, dateFrom, dateTo]) => {
    localEmployeeId.value = employeeId
    localDateFrom.value = dateFrom
    localDateTo.value = dateTo
  },
)

function pillClass(active: boolean): string {
  return active
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50'
}

function handleSearch() {
  emit('apply', localEmployeeId.value, localDateFrom.value, localDateTo.value)
}

function handleReset() {
  localEmployeeId.value = null
  localDateFrom.value = ''
  localDateTo.value = ''
  emit('reset')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="pill in QUEUE_PILLS"
        :key="pill.key"
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(queue === pill.key)"
        @click="emit('update:queue', pill.key)"
      >
        {{ pill.label }} · {{ counts[pill.key] }}
      </button>
    </div>

    <div class="flex flex-wrap items-end gap-3">
      <div v-if="canViewAny" class="w-[260px]">
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Employee</label>
        <EmployeeSearchSelect
          v-model="localEmployeeId"
          placeholder="Name or employee code"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">From</label>
        <el-date-picker
          v-model="localDateFrom"
          type="date"
          placeholder="From date"
          value-format="YYYY-MM-DD"
          class="!w-[170px]"
          clearable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">To</label>
        <el-date-picker
          v-model="localDateTo"
          type="date"
          placeholder="To date"
          value-format="YYYY-MM-DD"
          class="!w-[170px]"
          clearable
        />
      </div>
      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
