<script setup lang="ts">
import { ref } from 'vue'
import { Filter } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'

const emit = defineEmits<{
  apply: [month: string, year: string, employeeId: string]
}>()

const { can } = usePermission()

const currentYear = new Date().getFullYear()
const localMonth = ref('')
const localYear = ref('')
const localEmployeeId = ref('')

const monthOptions = [
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
]

const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i))

function handleSearch() {
  emit('apply', localMonth.value, localYear.value, localEmployeeId.value)
}

function handleReset() {
  localMonth.value = ''
  localYear.value = ''
  localEmployeeId.value = ''
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
        <p class="text-xs text-slate-400">Filter payslips by month, year, or employee.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <el-select v-model="localMonth" placeholder="All Months" clearable class="!w-[160px]">
        <el-option v-for="opt in monthOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>

      <el-select v-model="localYear" placeholder="All Years" clearable class="!w-[130px]">
        <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
      </el-select>

      <el-input
        v-if="can('payslips.view_any')"
        v-model="localEmployeeId"
        placeholder="Employee ID"
        clearable
        class="!w-[160px]"
      />

      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
