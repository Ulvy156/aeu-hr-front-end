<script setup lang="ts">
import { ref } from 'vue'
import { Filter } from '@lucide/vue'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'

const emit = defineEmits<{
  apply: [dateFrom: string, dateTo: string, status: string]
}>()

const localDateFrom = ref('')
const localDateTo = ref('')
const localStatus = ref('')

const statusOptions = [
  { label: 'Present', value: 'present' },
  { label: 'Late', value: 'late' },
  { label: 'Absent', value: 'absent' },
  { label: 'Missing Clock-out', value: 'missing_clock_out' },
]

function handleSearch() {
  emit('apply', localDateFrom.value, localDateTo.value, localStatus.value)
}

function handleReset() {
  localDateFrom.value = ''
  localDateTo.value = ''
  localStatus.value = ''
  emit('apply', '', '', '')
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
        <p class="text-xs text-slate-400">Filter attendance by date range or status.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <el-date-picker
        v-model="localDateFrom"
        type="date"
        placeholder="From date"
        value-format="YYYY-MM-DD"
        class="!w-[170px]"
        clearable
      />
      <el-date-picker
        v-model="localDateTo"
        type="date"
        placeholder="To date"
        value-format="YYYY-MM-DD"
        class="!w-[170px]"
        clearable
      />
      <el-select v-model="localStatus" placeholder="All Status" clearable class="!w-[200px]">
        <el-option
          v-for="opt in statusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
