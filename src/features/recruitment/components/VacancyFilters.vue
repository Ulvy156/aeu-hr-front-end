<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, X } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { fetchDepartments } from '@/features/departments/services/department.api'
import type { VacancyStatus, VacancySummary } from '../types/vacancy'
import { formatVacancyDate } from '../utils/vacancyDisplay'

type ChipKey = 'search' | 'department' | 'status' | 'targetHiringDate'

const props = defineProps<{
  search: string
  department: number | null
  status: VacancyStatus | ''
  targetHiringDate: string
  summary: VacancySummary
}>()

const emit = defineEmits<{
  apply: [
    search: string,
    department: number | null,
    status: VacancyStatus | '',
    targetHiringDate: string,
  ]
}>()

const localSearch = ref(props.search)
const localDepartment = ref<number | null>(props.department)
const localStatus = ref<VacancyStatus | ''>(props.status)
const localTargetHiringDate = ref(props.targetHiringDate)

const departmentOptions = ref<{ id: number; name: string }[]>([])

const departmentSelectOptions = computed(() =>
  departmentOptions.value.map((opt) => ({ label: opt.name, value: opt.id })),
)

const allCount = computed(() => props.summary.open_count + props.summary.closed_count)

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.search.trim()) {
    items.push({ key: 'search', label: `“${props.search.trim()}”` })
  }
  if (props.department) {
    const name = departmentOptions.value.find((opt) => opt.id === props.department)?.name
    items.push({ key: 'department', label: name ?? 'Department' })
  }
  if (props.status) {
    items.push({ key: 'status', label: props.status === 'open' ? 'Open' : 'Closed' })
  }
  if (props.targetHiringDate) {
    items.push({ key: 'targetHiringDate', label: formatVacancyDate(props.targetHiringDate) })
  }
  return items
})

onMounted(async () => {
  try {
    const res = await fetchDepartments({ status: 'active', per_page: 100 })
    departmentOptions.value = res.data.map((d) => ({ id: d.id, name: d.name }))
  } catch {
    departmentOptions.value = []
  }
})

function apply(
  search: string,
  department: number | null,
  status: VacancyStatus | '',
  targetHiringDate: string,
) {
  emit('apply', search, department, status, targetHiringDate || '')
}

function handleSearch() {
  apply(localSearch.value, localDepartment.value, localStatus.value, localTargetHiringDate.value)
}

function handleReset() {
  localSearch.value = ''
  localDepartment.value = null
  localStatus.value = ''
  localTargetHiringDate.value = ''
  apply('', null, '', '')
}

function handleStatus(value: VacancyStatus | '') {
  const next = value !== '' && localStatus.value === value ? '' : value
  if (next === localStatus.value) return
  localStatus.value = next
  apply(props.search, props.department, next, props.targetHiringDate)
}

function clearChip(key: ChipKey) {
  const next = {
    search: props.search,
    department: props.department,
    status: props.status,
    targetHiringDate: props.targetHiringDate,
  }

  if (key === 'search') {
    next.search = ''
    localSearch.value = ''
  } else if (key === 'department') {
    next.department = null
    localDepartment.value = null
  } else if (key === 'status') {
    next.status = ''
    localStatus.value = ''
  } else {
    next.targetHiringDate = ''
    localTargetHiringDate.value = ''
  }

  apply(next.search, next.department, next.status, next.targetHiringDate)
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
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === '')"
        @click="handleStatus('')"
      >
        All · {{ allCount }}
      </button>
      <button
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === 'open')"
        @click="handleStatus('open')"
      >
        Open · {{ summary.open_count }}
      </button>
      <button
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === 'closed')"
        @click="handleStatus('closed')"
      >
        Closed · {{ summary.closed_count }}
      </button>
    </div>

    <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Search</label>
        <BaseInput
          v-model="localSearch"
          placeholder="Search by title"
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
          v-model="localDepartment"
          :options="departmentSelectOptions"
          placeholder="All departments"
          clearable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Target hiring date</label>
        <el-date-picker
          v-model="localTargetHiringDate"
          type="date"
          placeholder="Any target date"
          value-format="YYYY-MM-DD"
          clearable
          class="!w-full"
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
