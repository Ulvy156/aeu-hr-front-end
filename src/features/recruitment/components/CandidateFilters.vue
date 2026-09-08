<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, X } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { fetchVacancies } from '../services/vacancy.api'
import {
  CANDIDATE_SOURCE_LABELS,
  CANDIDATE_SOURCE_OPTIONS,
  CANDIDATE_STATUS_FILTER_LABELS,
  CLOSED_STATUS_FILTERS,
  PIPELINE_STATUS_FILTERS,
} from '../constants/candidateFilters'
import type { CandidateSource, CandidateStatus } from '../types/candidate'

type ChipKey = 'search' | 'vacancy' | 'source' | 'status' | 'interviewDate'

const props = defineProps<{
  search: string
  vacancy: number | null
  source: CandidateSource | ''
  status: CandidateStatus | ''
  interviewDate: string
  total?: number
}>()

const emit = defineEmits<{
  apply: [
    search: string,
    vacancy: number | null,
    source: CandidateSource | '',
    status: CandidateStatus | '',
    interviewDate: string,
  ]
}>()

const localSearch = ref(props.search)
const localVacancy = ref<number | null>(props.vacancy)
const localSource = ref<CandidateSource | ''>(props.source)
const localStatus = ref<CandidateStatus | ''>(props.status)
const localInterviewDate = ref(props.interviewDate)

const vacancyOptions = ref<{ id: number; title: string }[]>([])

const vacancySelectOptions = computed(() =>
  vacancyOptions.value.map((opt) => ({ label: opt.title, value: opt.id })),
)

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.search.trim()) {
    items.push({ key: 'search', label: `“${props.search.trim()}”` })
  }
  if (props.vacancy) {
    const title = vacancyOptions.value.find((opt) => opt.id === props.vacancy)?.title
    items.push({ key: 'vacancy', label: title ?? 'Vacancy' })
  }
  if (props.source) {
    items.push({ key: 'source', label: CANDIDATE_SOURCE_LABELS[props.source] ?? props.source })
  }
  if (props.status) {
    items.push({
      key: 'status',
      label: CANDIDATE_STATUS_FILTER_LABELS[props.status] ?? props.status,
    })
  }
  if (props.interviewDate) {
    items.push({ key: 'interviewDate', label: formatChipDate(props.interviewDate) })
  }
  return items
})

onMounted(async () => {
  try {
    const res = await fetchVacancies({ per_page: 100 })
    vacancyOptions.value = res.data.map((v) => ({ id: v.id, title: v.title }))
  } catch {
    vacancyOptions.value = []
  }
})

function formatChipDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function apply(
  search: string,
  vacancy: number | null,
  source: CandidateSource | '',
  status: CandidateStatus | '',
  interviewDate: string,
) {
  emit('apply', search, vacancy, source, status, interviewDate || '')
}

function handleSearch() {
  apply(
    localSearch.value,
    localVacancy.value,
    localSource.value,
    localStatus.value,
    localInterviewDate.value,
  )
}

function handleReset() {
  localSearch.value = ''
  localVacancy.value = null
  localSource.value = ''
  localStatus.value = ''
  localInterviewDate.value = ''
  apply('', null, '', '', '')
}

function handleStatus(value: CandidateStatus | '') {
  const next = value !== '' && localStatus.value === value ? '' : value
  localStatus.value = next
  apply(props.search, props.vacancy, props.source, next, props.interviewDate)
}

function clearChip(key: ChipKey) {
  const next = {
    search: props.search,
    vacancy: props.vacancy,
    source: props.source,
    status: props.status,
    interviewDate: props.interviewDate,
  }

  if (key === 'search') {
    next.search = ''
    localSearch.value = ''
  } else if (key === 'vacancy') {
    next.vacancy = null
    localVacancy.value = null
  } else if (key === 'source') {
    next.source = ''
    localSource.value = ''
  } else if (key === 'status') {
    next.status = ''
    localStatus.value = ''
  } else {
    next.interviewDate = ''
    localInterviewDate.value = ''
  }

  apply(next.search, next.vacancy, next.source, next.status, next.interviewDate)
}

function pillClass(active: boolean): string {
  return active
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by name, phone, or email"
        clearable
        class="min-w-[240px] flex-1"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <div class="flex shrink-0 gap-2">
        <SearchButton @click="handleSearch" />
        <ResetButton @click="handleReset" />
      </div>
    </div>

    <div>
      <div class="mb-2 flex items-center gap-2">
        <span class="text-xs font-medium text-slate-500">Pipeline</span>
        <span class="text-xs text-slate-400">Applies immediately</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="stage in PIPELINE_STATUS_FILTERS"
          :key="stage.value || 'all'"
          type="button"
          class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
          :class="pillClass(localStatus === stage.value)"
          @click="handleStatus(stage.value)"
        >
          {{ stage.label }}
        </button>
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <span class="mr-1 text-xs text-slate-400">Closed</span>
        <button
          v-for="stage in CLOSED_STATUS_FILTERS"
          :key="stage.value"
          type="button"
          class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
          :class="pillClass(localStatus === stage.value)"
          @click="handleStatus(stage.value)"
        >
          {{ stage.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Vacancy</label>
        <BaseSelect
          v-model="localVacancy"
          :options="vacancySelectOptions"
          placeholder="All vacancies"
          clearable
          filterable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Source</label>
        <BaseSelect
          v-model="localSource"
          :options="CANDIDATE_SOURCE_OPTIONS"
          placeholder="All sources"
          clearable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Interview date</label>
        <el-date-picker
          v-model="localInterviewDate"
          type="date"
          placeholder="Any interview date"
          value-format="YYYY-MM-DD"
          clearable
          class="!w-full"
        />
      </div>
    </div>

    <div
      v-if="chips.length"
      class="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3"
    >
      <span class="text-xs text-slate-500">
        {{ chips.length }} active · {{ total ?? 0 }} results
      </span>
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
