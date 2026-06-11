<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'

const props = defineProps<{
  search: string
  status: string
}>()

const emit = defineEmits<{
  apply: [search: string, status: string]
}>()

const localSearch = ref(props.search)
const localStatus = ref(props.status)

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

function handleSearch() {
  emit('apply', localSearch.value, localStatus.value ?? '')
}

function handleReset() {
  localSearch.value = ''
  localStatus.value = ''
  emit('apply', '', '')
}
</script>

<template>
  <div class="flex justify-between items-center gap-3">
    <div class="flex gap-x-3 w-1/2">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by category name..."
        clearable
        class="w-1/2"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <BaseSelect v-model="localStatus" :options="statusOptions" placeholder="All Status" clearable class="w-1/2" />
    </div>

    <div class="w-1/2 flex justify-end">
      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
