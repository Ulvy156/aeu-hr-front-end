<script setup lang="ts">
import { ref } from 'vue'
import { Search, Filter } from '@lucide/vue'
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
const props = defineProps<{
  search: string
  status: string
  year: string
}>()

const emit = defineEmits<{
  apply: [search: string, status: string, year: string]
}>()

const localSearch = ref(props.search)
const localStatus = ref(props.status)
const localYear = ref(props.year)

const currentYear = new Date().getFullYear()
const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
  label: String(y),
  value: String(y),
}))

function handleSearch() {
  emit('apply', localSearch.value, localStatus.value, localYear.value)
}

function handleReset() {
  localSearch.value = ''
  localStatus.value = ''
  localYear.value = ''
  emit('apply', '', '', '')
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
    <!-- Header -->
    <div class="flex items-center gap-2.5 mb-4">
      <div class="p-1.5 bg-slate-50 rounded-md border border-gray-100 shrink-0">
        <Filter class="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-slate-700">Filters</h3>
        <p class="text-xs text-slate-400">Search and narrow holidays by status or year.</p>
      </div>
    </div>

    <!-- Inputs -->
    <div class="flex flex-wrap items-center gap-3">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by name or description..."
        clearable
        class="flex-1 min-w-50"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <el-select v-model="localStatus" placeholder="All Status" clearable class="w-45!">
        <el-option label="Active" value="active" />
        <el-option label="Inactive" value="inactive" />
      </el-select>

      <el-select v-model="localYear" placeholder="All Years" clearable class="w-45!">
        <el-option v-for="y in yearOptions" :key="y.value" :label="y.label" :value="y.value" />
      </el-select>

      <BaseButton type="primary" @click="handleSearch">Search</BaseButton>
      <BaseButton @click="handleReset">Reset</BaseButton>
    </div>
  </div>
</template>
