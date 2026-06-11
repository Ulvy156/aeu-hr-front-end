<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Filter, Search } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { usePermission } from '@/composables/usePermissions'
import { fetchAnnouncementCategories, fetchAnnouncementCategory } from '../services/announcement-category.api'
import { fetchUsers } from '@/features/users/services/user.api'
import type { AnnouncementCategory } from '../types/announcement-category'
import type { UserListItem } from '@/features/users/types/user'

export interface AnnouncementFilterValues {
  search: string
  category: number | ''
  priority: string
  status: string
  created_by: number | ''
}

const emit = defineEmits<{
  apply: [filters: AnnouncementFilterValues]
}>()

const { can } = usePermission()

const localSearch = ref('')
const localCategory = ref<number | ''>('')
const localPriority = ref('')
const localStatus = ref('')
const localCreatedBy = ref<number | ''>('')

const categoryOptions = ref<AnnouncementCategory[]>([])
const userOptions = ref<UserListItem[]>([])

const priorityOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Important', value: 'important' },
  { label: 'Urgent', value: 'urgent' },
]

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Published', value: 'published' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Archived', value: 'archived' },
]

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

function handleSearch() {
  emit('apply', {
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
  emit('apply', { search: '', category: '', priority: '', status: '', created_by: '' })
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
    <div class="flex items-center gap-2.5 mb-4">
      <div class="p-1.5 bg-slate-50 rounded-md border border-gray-100 shrink-0">
        <Filter class="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-slate-700">Filters</h3>
        <p class="text-xs text-slate-400">Filter announcements by category, priority, or status.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by title..."
        clearable
        class="!w-[200px]"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <BaseSelect
        v-model="localCategory"
        :options="categoryOptions.map((opt) => ({ label: opt.name, value: opt.id }))"
        placeholder="Category"
        clearable
        class="!w-[160px]"
      />

      <BaseSelect
        v-model="localPriority"
        :options="priorityOptions"
        placeholder="Priority"
        clearable
        class="!w-[150px]"
      />

      <BaseSelect
        v-model="localStatus"
        :options="statusOptions"
        placeholder="Status"
        clearable
        class="!w-[170px]"
      />

      <BaseSelect
        v-if="userOptions.length"
        v-model="localCreatedBy"
        :options="userOptions.map((opt) => ({ label: opt.name, value: opt.id }))"
        placeholder="Created By"
        clearable
        filterable
        class="!w-[180px]"
      />

      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
