<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, X } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { fetchAnnouncementCategories } from '../services/announcement-category.api'
import type { AnnouncementCategory } from '../types/announcement-category'
import type { AnnouncementBoardCounts, AnnouncementReadStatus } from '../types/announcement'
import { ANNOUNCEMENT_PRIORITY_OPTIONS } from '../constants/announcementFilters'
import { announcementPriorityLabel } from '../utils/announcementDisplay'

export interface AnnouncementBoardFilterValues {
  search: string
  category: number | ''
  priority: string
  read_status: string
}

type ChipKey = 'search' | 'category' | 'priority' | 'read_status'

const props = defineProps<{
  search: string
  category: number | ''
  priority: string
  readStatus: string
  counts: AnnouncementBoardCounts
}>()

const emit = defineEmits<{
  apply: [filters: AnnouncementBoardFilterValues]
}>()

const localSearch = ref(props.search)
const localCategory = ref<number | ''>(props.category)
const localPriority = ref(props.priority)
const localReadStatus = ref(props.readStatus)

const categoryOptions = ref<AnnouncementCategory[]>([])

const pills: {
  value: AnnouncementReadStatus | ''
  label: string
  countKey: keyof AnnouncementBoardCounts
}[] = [
  { value: '', label: 'All', countKey: 'all' },
  { value: 'unread', label: 'Unread', countKey: 'unread' },
  { value: 'read', label: 'Read', countKey: 'read' },
]

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.search.trim()) items.push({ key: 'search', label: `“${props.search.trim()}”` })
  if (props.category) {
    const name = categoryOptions.value.find((opt) => opt.id === props.category)?.name
    items.push({ key: 'category', label: name ?? 'Category' })
  }
  if (props.priority) {
    items.push({
      key: 'priority',
      label: announcementPriorityLabel(props.priority as 'normal' | 'important' | 'urgent'),
    })
  }
  if (props.readStatus) {
    items.push({ key: 'read_status', label: props.readStatus === 'unread' ? 'Unread' : 'Read' })
  }
  return items
})

onMounted(async () => {
  try {
    const res = await fetchAnnouncementCategories({ status: 'active', per_page: 100 })
    categoryOptions.value = res.data
  } catch {
    categoryOptions.value = []
  }
})

function apply(next: AnnouncementBoardFilterValues) {
  emit('apply', next)
}

function handleSearch() {
  apply({
    search: localSearch.value,
    category: localCategory.value,
    priority: localPriority.value,
    read_status: localReadStatus.value,
  })
}

function handleReset() {
  localSearch.value = ''
  localCategory.value = ''
  localPriority.value = ''
  localReadStatus.value = ''
  apply({ search: '', category: '', priority: '', read_status: '' })
}

function handleReadStatus(value: AnnouncementReadStatus | '') {
  const next = value !== '' && localReadStatus.value === value ? '' : value
  if (next === localReadStatus.value) return
  localReadStatus.value = next
  apply({
    search: props.search,
    category: props.category,
    priority: props.priority,
    read_status: next,
  })
}

function clearChip(key: ChipKey) {
  const next: AnnouncementBoardFilterValues = {
    search: props.search,
    category: props.category,
    priority: props.priority,
    read_status: props.readStatus,
  }

  if (key === 'search') {
    next.search = ''
    localSearch.value = ''
  } else if (key === 'category') {
    next.category = ''
    localCategory.value = ''
  } else if (key === 'priority') {
    next.priority = ''
    localPriority.value = ''
  } else {
    next.read_status = ''
    localReadStatus.value = ''
  }

  apply(next)
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
        :class="pillClass(localReadStatus === pill.value)"
        @click="handleReadStatus(pill.value)"
      >
        {{ pill.label }} · {{ counts[pill.countKey] }}
      </button>
    </div>

    <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Search</label>
        <BaseInput
          v-model="localSearch"
          placeholder="Title or content"
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
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Category</label>
        <BaseSelect
          v-model="localCategory"
          :options="categoryOptions.map((opt) => ({ label: opt.name, value: opt.id }))"
          placeholder="All categories"
          clearable
        />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Priority</label>
        <BaseSelect
          v-model="localPriority"
          :options="ANNOUNCEMENT_PRIORITY_OPTIONS"
          placeholder="All priorities"
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
