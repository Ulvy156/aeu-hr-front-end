<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Search, X } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { usePermission } from '@/composables/usePermissions'
import {
  fetchAnnouncementCategories,
  fetchAnnouncementCategory,
} from '../services/announcement-category.api'
import { fetchUsers } from '@/features/users/services/user.api'
import type { AnnouncementCategory } from '../types/announcement-category'
import type { UserListItem } from '@/features/users/types/user'
import type { AnnouncementStatus, AnnouncementStatusCounts } from '../types/announcement'
import {
  ANNOUNCEMENT_PRIORITY_OPTIONS,
  ANNOUNCEMENT_STATUS_PILLS,
} from '../constants/announcementFilters'
import { announcementStatusLabel } from '../utils/announcementDisplay'

export interface AnnouncementFilterValues {
  search: string
  category: number | ''
  priority: string
  status: string
  created_by: number | ''
}

type ChipKey = 'search' | 'category' | 'priority' | 'status' | 'created_by'

const props = defineProps<{
  search: string
  category: number | ''
  priority: string
  status: string
  createdBy: number | ''
  counts: AnnouncementStatusCounts
}>()

const emit = defineEmits<{
  apply: [filters: AnnouncementFilterValues]
}>()

const { can } = usePermission()

const localSearch = ref(props.search)
const localCategory = ref<number | ''>(props.category)
const localPriority = ref(props.priority)
const localStatus = ref(props.status)
const localCreatedBy = ref<number | ''>(props.createdBy)

const categoryOptions = ref<AnnouncementCategory[]>([])
const userOptions = ref<UserListItem[]>([])

const chips = computed(() => {
  const items: { key: ChipKey; label: string }[] = []
  if (props.search.trim()) items.push({ key: 'search', label: `“${props.search.trim()}”` })
  if (props.category) {
    const name = categoryOptions.value.find((opt) => opt.id === props.category)?.name
    items.push({ key: 'category', label: name ?? 'Category' })
  }
  if (props.priority) {
    const name = ANNOUNCEMENT_PRIORITY_OPTIONS.find((opt) => opt.value === props.priority)?.label
    items.push({ key: 'priority', label: name ?? props.priority })
  }
  if (props.status) {
    items.push({
      key: 'status',
      label: announcementStatusLabel(props.status as AnnouncementStatus),
    })
  }
  if (props.createdBy) {
    const name = userOptions.value.find((opt) => opt.id === props.createdBy)?.name
    items.push({ key: 'created_by', label: name ?? 'Created by' })
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

  if (can('users.view')) {
    try {
      const res = await fetchUsers({ per_page: 100 })
      userOptions.value = res.data
    } catch {
      userOptions.value = []
    }
  }
})

watch(localCategory, async (val) => {
  if (val && !categoryOptions.value.some((c) => c.id === val)) {
    try {
      const res = await fetchAnnouncementCategory(val as number)
      categoryOptions.value = [...categoryOptions.value, res.data]
    } catch {
      // currently selected category could not be loaded, ignore
    }
  }
})

function apply(next: AnnouncementFilterValues) {
  emit('apply', next)
}

function handleSearch() {
  apply({
    search: localSearch.value,
    category: localCategory.value,
    priority: localPriority.value,
    status: localStatus.value,
    created_by: localCreatedBy.value,
  })
}

function handleReset() {
  localSearch.value = ''
  localCategory.value = ''
  localPriority.value = ''
  localStatus.value = ''
  localCreatedBy.value = ''
  apply({ search: '', category: '', priority: '', status: '', created_by: '' })
}

function handleStatus(value: AnnouncementStatus | '') {
  const next = value !== '' && localStatus.value === value ? '' : value
  if (next === localStatus.value) return
  localStatus.value = next
  apply({
    search: props.search,
    category: props.category,
    priority: props.priority,
    status: next,
    created_by: props.createdBy,
  })
}

function clearChip(key: ChipKey) {
  const next: AnnouncementFilterValues = {
    search: props.search,
    category: props.category,
    priority: props.priority,
    status: props.status,
    created_by: props.createdBy,
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
  } else if (key === 'status') {
    next.status = ''
    localStatus.value = ''
  } else {
    next.created_by = ''
    localCreatedBy.value = ''
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
        v-for="pill in ANNOUNCEMENT_STATUS_PILLS"
        :key="pill.value || 'all'"
        type="button"
        class="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="pillClass(localStatus === pill.value)"
        @click="handleStatus(pill.value)"
      >
        {{ pill.label }} · {{ counts[pill.countKey] }}
      </button>
    </div>

    <div
      class="grid grid-cols-1 items-end gap-4"
      :class="
        userOptions.length
          ? 'md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]'
          : 'md:grid-cols-[1.4fr_1fr_1fr_auto]'
      "
    >
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
      <div v-if="userOptions.length">
        <label class="mb-1.5 block text-xs font-medium text-slate-500">Created by</label>
        <BaseSelect
          v-model="localCreatedBy"
          :options="userOptions.map((opt) => ({ label: opt.name, value: opt.id }))"
          placeholder="Anyone"
          clearable
          filterable
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
