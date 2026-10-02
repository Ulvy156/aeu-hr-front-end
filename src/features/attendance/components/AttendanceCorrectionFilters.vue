<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchEmployees } from '@/features/employees/services/employee.api'
import type { EmployeeSearchOption } from '@/features/employees/services/employee.api'
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
  employeeId: string | null
  dateFrom: string
  dateTo: string
  counts: CorrectionQueueCounts
  canViewAny: boolean
}>()

const emit = defineEmits<{
  'update:queue': [queue: CorrectionQueue]
  apply: [employeeId: string | null, dateFrom: string, dateTo: string]
  reset: []
}>()

const localEmployeeId = ref<string | null>(props.employeeId)
const employeeOptions = ref<EmployeeSearchOption[]>([])
const loadingEmployees = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

function searchEmployee(query: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (query.length < 2) {
      employeeOptions.value = []
      return
    }
    loadingEmployees.value = true
    try {
      employeeOptions.value = await searchEmployees(query)
    } catch {
      employeeOptions.value = []
    } finally {
      loadingEmployees.value = false
    }
  }, 300)
}
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
  employeeOptions.value = []
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
        <el-select
          v-model="localEmployeeId"
          placeholder="Name or employee code"
          filterable
          remote
          clearable
          :remote-method="searchEmployee"
          :loading="loadingEmployees"
          class="w-full"
        >
          <el-option
            v-for="employee in employeeOptions"
            :key="employee.employee_id"
            :label="employee.display"
            :value="employee.employee_id"
          />
        </el-select>
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
