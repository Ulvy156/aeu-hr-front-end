<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Filter, Search } from '@lucide/vue'
import { BaseInput } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { fetchAnnouncementCategories } from '../services/announcement-category.api'
import type { AnnouncementCategory } from '../types/announcement-category'

export interface AnnouncementBoardFilterValues {
  search: string
  category: number | ''
  read_status: string
}

const emit = defineEmits<{
  apply: [filters: AnnouncementBoardFilterValues]
}>()

const localSearch = ref('')
const localCategory = ref<number | ''>('')
const localReadStatus = ref('')

const categoryOptions = ref<AnnouncementCategory[]>([])

onMounted(async () => {
  try {
    const res = await fetchAnnouncementCategories({ status: 'active', per_page: 100 })
    categoryOptions.value = res.data
  } catch {
    categoryOptions.value = []
  }
})

function handleSearch() {
  emit('apply', {
    search: localSearch.value,
    category: localCategory.value,
    read_status: localReadStatus.value,
  })
}

function handleReset() {
  localSearch.value = ''
  localCategory.value = ''
  localReadStatus.value = ''
  emit('apply', { search: '', category: '', read_status: '' })
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
        <p class="text-xs text-slate-400">Filter announcements by category or read status.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by title..."
        clearable
        class="!w-[220px]"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <el-select v-model="localCategory" placeholder="Category" clearable class="!w-[180px]">
        <el-option
          v-for="opt in categoryOptions"
          :key="opt.id"
          :label="opt.name"
          :value="opt.id"
        />
      </el-select>

      <el-select v-model="localReadStatus" placeholder="Read Status" clearable class="!w-[160px]">
        <el-option label="Unread" value="unread" />
        <el-option label="Read" value="read" />
      </el-select>

      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
