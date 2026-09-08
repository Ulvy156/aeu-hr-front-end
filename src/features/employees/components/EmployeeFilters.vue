<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, X } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import {
  EMPLOYMENT_STATUS_LABELS,
  type DeptOption,
  type EmployeeStatusCounts,
  type EmploymentStatus,
  type PositionOption,
} from '../types/employee'
import {
  JOB_LEVEL_LABELS,
  JOB_LEVEL_OPTIONS,
  formatPositionLabel,
  type JobLevel,
} from '@/features/positions/types/job-level'

type ChipKey = 'search' | 'department' | 'position' | 'jobLevel' | 'status'

const props = defineProps<{
  search: string
  departmentId: number | null
  positionId: number | null
  jobLevel: JobLevel | ''
  employmentStatus: string
  departments: DeptOption[]
  positions: PositionOption[]
  counts: EmployeeStatusCounts
}>()

const emit = defineEmits<{
  apply: [
    search: string,
    deptId: number | null,
    posId: number | null,
    jobLevel: JobLevel | '',
    status: string,
  ]
}>()

const localSearch = ref(props.search)
const localDeptId = ref<number | null>(props.departmentId)
const localPosId = ref<number | null>(props.positionId)
const localJobLevel = ref<JobLevel | ''>(props.jobLevel)
const localStatus = ref(props.employmentStatus)

const pills: {
  value: EmploymentStatus | ''
  label: string
  countKey: keyof EmployeeStatusCounts
}[] = [
  { value: '', label: 'All', countKey: 'all' },
  { value: 'full-time', label: 'Full-time', countKey: 'full-time' },
  { value: 'probation', label: 'Probation', countKey: 'probation' },
  { value: 'intern', label: 'Intern', countKey: 'intern' },
  { value: 'resigned', label: 'Resigned', countKey: 'resigned' },
  { value: 'terminated', label: 'Terminated', countKey: 'terminated' },
]

const departmentOptions = computed(() =>
  props.departments.map((d) => ({ label: d.name, value: d.id })),
)

const filteredPositions = computed(() => {
  if (!localDeptId.value) return props.positions
  return props.positions.filter((p) => p.department_id === localDeptId.value)
})

const positionOptions = computed(() =>
  filteredPositions.value.map((p) => ({
    label: formatPositionLabel(p.name, p.job_level),
    value: p.id,
  })),
)

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.search.trim()) {
    items.push({ key: 'search', label: `“${props.search.trim()}”` })
  }
  if (props.departmentId) {
    const name = props.departments.find((d) => d.id === props.departmentId)?.name
    items.push({ key: 'department', label: name ?? 'Department' })
  }
  if (props.positionId) {
    const position = props.positions.find((p) => p.id === props.positionId)
    items.push({
      key: 'position',
      label: position ? formatPositionLabel(position.name, position.job_level) : 'Position',
    })
  }
  if (props.jobLevel) {
    items.push({ key: 'jobLevel', label: JOB_LEVEL_LABELS[props.jobLevel] ?? props.jobLevel })
  }
  if (props.employmentStatus) {
    items.push({
      key: 'status',
      label:
        EMPLOYMENT_STATUS_LABELS[props.employmentStatus as EmploymentStatus] ??
        props.employmentStatus,
    })
  }
  return items
})

function apply(
  search: string,
  deptId: number | null,
  posId: number | null,
  jobLevel: JobLevel | '',
  status: string,
) {
  emit('apply', search, deptId, posId, jobLevel, status)
}

function onDeptChange() {
  if (!localPosId.value) return
  const stillValid = filteredPositions.value.some((p) => p.id === localPosId.value)
  if (!stillValid) localPosId.value = null
}

function handleSearch() {
  apply(
    localSearch.value,
    localDeptId.value,
    localPosId.value,
    localJobLevel.value ?? '',
    localStatus.value,
  )
}

function handleReset() {
  localSearch.value = ''
  localDeptId.value = null
  localPosId.value = null
  localJobLevel.value = ''
  localStatus.value = ''
  apply('', null, null, '', '')
}

function handleStatus(value: EmploymentStatus | '') {
  const next = value !== '' && localStatus.value === value ? '' : value
  if (next === localStatus.value) return
  localStatus.value = next
  apply(props.search, props.departmentId, props.positionId, props.jobLevel, next)
}

function clearChip(key: ChipKey) {
  const next = {
    search: props.search,
    departmentId: props.departmentId,
    positionId: props.positionId,
    jobLevel: props.jobLevel,
    status: props.employmentStatus,
  }

  if (key === 'search') {
    next.search = ''
    localSearch.value = ''
  } else if (key === 'department') {
    next.departmentId = null
    localDeptId.value = null
  } else if (key === 'position') {
    next.positionId = null
    localPosId.value = null
  } else if (key === 'jobLevel') {
    next.jobLevel = ''
    localJobLevel.value = ''
  } else {
    next.status = ''
    localStatus.value = ''
  }

  apply(next.search, next.departmentId, next.positionId, next.jobLevel, next.status)
}

function pillClass(active: boolean): string {
  return active
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="pill in pills"
        :key="pill.value || 'all'"
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === pill.value)"
        @click="handleStatus(pill.value)"
      >
        {{ pill.label }} · {{ counts[pill.countKey] }}
      </button>
    </div>

    <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[1.5fr_1fr_1fr_0.9fr_auto]">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Search</label>
        <BaseInput
          v-model="localSearch"
          placeholder="Employee ID, name, or email"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <Search class="w-4 h-4 text-slate-400" />
          </template>
        </BaseInput>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Department</label>
        <BaseSelect
          v-model="localDeptId"
          :options="departmentOptions"
          placeholder="All departments"
          clearable
          @change="onDeptChange"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Position</label>
        <BaseSelect
          v-model="localPosId"
          :options="positionOptions"
          placeholder="All positions"
          clearable
          filterable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Job level</label>
        <BaseSelect
          v-model="localJobLevel"
          :options="JOB_LEVEL_OPTIONS"
          placeholder="All job levels"
          clearable
        />
      </div>
      <div class="flex shrink-0 gap-2">
        <SearchButton @click="handleSearch" />
        <ResetButton @click="handleReset" />
      </div>
    </div>

    <div
      v-if="chips.length"
      class="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3"
    >
      <span class="text-xs text-slate-500">Active filters</span>
      <button
        v-for="chip in chips"
        :key="chip.key"
        type="button"
        class="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
        :aria-label="`Clear ${chip.label} filter`"
        @click="clearChip(chip.key)"
      >
        {{ chip.label }}
        <X class="h-3 w-3" />
      </button>
    </div>
  </div>
</template>
