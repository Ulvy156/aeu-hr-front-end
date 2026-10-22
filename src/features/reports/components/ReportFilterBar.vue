<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import {
  searchEmployees,
  type EmployeeSearchOption,
} from '@/features/employees/services/employee.api'
import {
  ATTENDANCE_STATUS_OPTIONS,
  LEAVE_STATUS_OPTIONS,
  LEAVE_TYPE_OPTIONS,
  PAYROLL_STATUS_OPTIONS,
  reportHasFilter,
  reportMonthOptions,
  reportYearOptions,
  type ReportDefinition,
  type ReportFilterKey,
} from '../constants/reports'

const props = defineProps<{
  report: ReportDefinition
  filters: Record<ReportFilterKey, string>
}>()

const emit = defineEmits<{
  'update:filters': [key: ReportFilterKey, value: string]
  search: []
  reset: []
}>()

const monthOptions = reportMonthOptions()
const yearOptions = reportYearOptions()

const employeeOptions = ref<EmployeeSearchOption[]>([])
const loadingEmployees = ref(false)
let employeeSearchTimer: ReturnType<typeof setTimeout> | null = null

const statusOptions = computed(() => {
  if (props.report.group === 'payroll') return PAYROLL_STATUS_OPTIONS
  if (props.report.group === 'attendance') return ATTENDANCE_STATUS_OPTIONS
  return LEAVE_STATUS_OPTIONS
})

function show(key: ReportFilterKey): boolean {
  return reportHasFilter(props.report, key)
}

function setFilter(key: ReportFilterKey, value: string | number | boolean | null | undefined) {
  emit('update:filters', key, value == null ? '' : String(value))
}

function onEmployeeSearch(query: string) {
  if (employeeSearchTimer) clearTimeout(employeeSearchTimer)
  employeeSearchTimer = setTimeout(() => fetchEmployeeOptions(query), 300)
}

async function fetchEmployeeOptions(query: string) {
  if (!query || query.length < 2) {
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
}

watch(
  () => [props.report.id, props.filters.employee_id] as const,
  ([, employeeId]) => {
    if (!employeeId) {
      employeeOptions.value = []
    }
  },
)
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
    <BaseSelect
      v-if="show('month')"
      :model-value="filters.month || undefined"
      :options="monthOptions"
      placeholder="Month"
      clearable
      class="w-full sm:!w-[150px]"
      @update:model-value="setFilter('month', $event)"
    />
    <BaseSelect
      v-if="show('year')"
      :model-value="filters.year || undefined"
      :options="yearOptions"
      placeholder="Year"
      clearable
      class="w-full sm:!w-[120px]"
      @update:model-value="setFilter('year', $event)"
    />
    <BaseSelect
      v-if="show('status')"
      :model-value="filters.status || undefined"
      :options="statusOptions"
      placeholder="Status"
      clearable
      class="w-full sm:!w-[160px]"
      @update:model-value="setFilter('status', $event)"
    />
    <BaseSelect
      v-if="show('leave_type')"
      :model-value="filters.leave_type || undefined"
      :options="LEAVE_TYPE_OPTIONS"
      placeholder="Leave type"
      clearable
      class="w-full sm:!w-[150px]"
      @update:model-value="setFilter('leave_type', $event)"
    />
    <el-date-picker
      v-if="show('attendance_date')"
      :model-value="filters.attendance_date || undefined"
      type="date"
      placeholder="Date"
      value-format="YYYY-MM-DD"
      clearable
      class="w-full sm:!w-[150px]"
      @update:model-value="setFilter('attendance_date', $event as string)"
    />
    <el-date-picker
      v-if="show('date_from')"
      :model-value="filters.date_from || undefined"
      type="date"
      placeholder="From"
      value-format="YYYY-MM-DD"
      clearable
      class="w-full sm:!w-[150px]"
      @update:model-value="setFilter('date_from', $event as string)"
    />
    <el-date-picker
      v-if="show('date_to')"
      :model-value="filters.date_to || undefined"
      type="date"
      placeholder="To"
      value-format="YYYY-MM-DD"
      clearable
      class="w-full sm:!w-[150px]"
      @update:model-value="setFilter('date_to', $event as string)"
    />
    <el-select
      v-if="show('employee_id')"
      :model-value="filters.employee_id || undefined"
      placeholder="Search employee..."
      filterable
      remote
      :remote-method="onEmployeeSearch"
      :loading="loadingEmployees"
      clearable
      class="w-full sm:!w-[260px]"
      @update:model-value="setFilter('employee_id', $event)"
    >
      <el-option
        v-for="emp in employeeOptions"
        :key="emp.employee_id"
        :value="emp.employee_id"
        :label="emp.display"
      />
    </el-select>
    <div class="flex items-center gap-2">
      <SearchButton @click="emit('search')" />
      <ResetButton @click="emit('reset')" />
    </div>
  </div>
</template>
