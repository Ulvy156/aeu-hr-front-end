<script setup lang="ts">
import { ref } from 'vue'
import { Filter } from '@lucide/vue'
import { usePermission } from '@/composables/usePermissions'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'

const emit = defineEmits<{
  apply: [status: string, leaveType: string, dateFrom: string, dateTo: string, employeeId: string]
}>()

const { can } = usePermission()

const localStatus = ref('')
const localLeaveType = ref('')
const localDateFrom = ref('')
const localDateTo = ref('')
const localEmployeeId = ref('')

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
]

const leaveTypeOptions = [
  { label: 'Annual', value: 'annual' },
  { label: 'Sick', value: 'sick' },
  { label: 'Special', value: 'special' },
  { label: 'Special Sick', value: 'special_sick' },
  { label: 'Maternity', value: 'maternity' },
  { label: 'Unpaid', value: 'unpaid' },
]

function handleSearch() {
  emit(
    'apply',
    localStatus.value,
    localLeaveType.value,
    localDateFrom.value,
    localDateTo.value,
    localEmployeeId.value,
  )
}

function handleReset() {
  localStatus.value = ''
  localLeaveType.value = ''
  localDateFrom.value = ''
  localDateTo.value = ''
  localEmployeeId.value = ''
  emit('apply', '', '', '', '', '')
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
        <p class="text-xs text-slate-400">Filter leave requests by status, type, or date range.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <el-select v-model="localStatus" placeholder="All Status" clearable class="!w-[160px]">
        <el-option
          v-for="opt in statusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-select v-model="localLeaveType" placeholder="Leave Type" clearable class="!w-[160px]">
        <el-option
          v-for="opt in leaveTypeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-date-picker
        v-model="localDateFrom"
        type="date"
        placeholder="From date"
        value-format="YYYY-MM-DD"
        class="!w-[160px]"
        clearable
      />
      <el-date-picker
        v-model="localDateTo"
        type="date"
        placeholder="To date"
        value-format="YYYY-MM-DD"
        class="!w-[160px]"
        clearable
      />

      <el-input
        v-if="can('leaves.view_any')"
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
