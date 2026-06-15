<script setup lang="ts">
import { ref } from 'vue'
import { Filter } from '@lucide/vue'
import { BaseSelect, EmployeeSearchSelect } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'

const emit = defineEmits<{
  apply: [filters: { employee_id: number | null; status: string }]
}>()

const localEmployeeId = ref<number | null>(null)
const localStatus = ref('')

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
]

function handleSearch() {
  emit('apply', { employee_id: localEmployeeId.value, status: localStatus.value })
}

function handleReset() {
  localEmployeeId.value = null
  localStatus.value = ''
  emit('apply', { employee_id: null, status: '' })
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
        <p class="text-xs text-slate-400">Filter upgrade requests by employee or status.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <EmployeeSearchSelect
        v-model="localEmployeeId"
        placeholder="Filter by employee..."
        class="!w-[220px]"
      />

      <BaseSelect
        v-model="localStatus"
        :options="statusOptions"
        placeholder="Status"
        clearable
        class="!w-[160px]"
      />

      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
