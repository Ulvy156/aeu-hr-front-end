<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, X } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import type { HolidayStatus, HolidayStatusCounts, HolidayYearCounts } from '../types/public-holiday'

type ChipKey = 'search' | 'status' | 'year'

const props = defineProps<{
  search: string
  status: HolidayStatus | ''
  year: string
  yearCounts: HolidayYearCounts
  statusCounts: HolidayStatusCounts
  currentYear: number
}>()

const emit = defineEmits<{
  apply: [search: string, status: HolidayStatus | '', year: string]
}>()

const localSearch = ref(props.search)
const localStatus = ref<HolidayStatus | ''>(props.status)
const localYear = ref(props.year)

const yearSelectOptions = computed(() => [
  { label: String(props.currentYear - 1), value: String(props.currentYear - 1) },
  { label: String(props.currentYear), value: String(props.currentYear) },
  { label: String(props.currentYear + 1), value: String(props.currentYear + 1) },
])

const yearPills = computed(() => [
  {
    value: String(props.currentYear - 1),
    label: String(props.currentYear - 1),
    count: props.yearCounts.previous,
  },
  {
    value: String(props.currentYear),
    label: String(props.currentYear),
    count: props.yearCounts.current,
  },
  {
    value: String(props.currentYear + 1),
    label: String(props.currentYear + 1),
    count: props.yearCounts.next,
  },
])

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.search.trim()) {
    items.push({ key: 'search', label: `“${props.search.trim()}”` })
  }
  if (props.status) {
    items.push({ key: 'status', label: props.status === 'active' ? 'Active' : 'Inactive' })
  }
  if (props.year) {
    items.push({ key: 'year', label: props.year })
  }
  return items
})

watch(
  () => [props.search, props.status, props.year] as const,
  ([search, status, year]) => {
    localSearch.value = search
    localStatus.value = status
    localYear.value = year
  },
)

function apply(search: string, status: HolidayStatus | '', year: string) {
  emit('apply', search, status, year)
}

function handleSearch() {
  apply(localSearch.value, localStatus.value, localYear.value || '')
}

function handleReset() {
  localSearch.value = ''
  localStatus.value = ''
  localYear.value = String(props.currentYear)
  apply('', '', String(props.currentYear))
}

function handleYear(value: string) {
  const next = value !== '' && localYear.value === value ? '' : value
  if (next === localYear.value) return
  localYear.value = next
  apply(props.search, props.status, next)
}

function handleStatus(value: HolidayStatus | '') {
  const next = value !== '' && localStatus.value === value ? '' : value
  if (next === localStatus.value) return
  localStatus.value = next
  apply(props.search, next, props.year)
}

function clearChip(key: ChipKey) {
  const next = {
    search: props.search,
    status: props.status,
    year: props.year,
  }

  if (key === 'search') {
    next.search = ''
    localSearch.value = ''
  } else if (key === 'status') {
    next.status = ''
    localStatus.value = ''
  } else {
    next.year = ''
    localYear.value = ''
  }

  apply(next.search, next.status, next.year)
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
        v-for="pill in yearPills"
        :key="pill.value"
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localYear === pill.value)"
        @click="handleYear(pill.value)"
      >
        {{ pill.label }} · {{ pill.count }}
      </button>
      <button
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localYear === '')"
        @click="handleYear('')"
      >
        All years · {{ yearCounts.all }}
      </button>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === '')"
        @click="handleStatus('')"
      >
        All · {{ statusCounts.all }}
      </button>
      <button
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === 'active')"
        @click="handleStatus('active')"
      >
        Active · {{ statusCounts.active }}
      </button>
      <button
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === 'inactive')"
        @click="handleStatus('inactive')"
      >
        Inactive · {{ statusCounts.inactive }}
      </button>
    </div>

    <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[1.6fr_0.8fr_auto]">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Search</label>
        <BaseInput
          v-model="localSearch"
          placeholder="Search by name or description"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <Search class="h-4 w-4 text-slate-400" />
          </template>
        </BaseInput>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Year</label>
        <BaseSelect
          v-model="localYear"
          :options="yearSelectOptions"
          placeholder="All years"
          clearable
          @clear="localYear = ''"
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
