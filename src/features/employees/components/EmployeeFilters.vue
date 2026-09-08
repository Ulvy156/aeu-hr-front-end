<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput, BaseSelect } from '@/components/common'
import { EMPLOYMENT_STATUS_OPTIONS } from '../types/employee'
import type { DeptOption, PositionOption } from '../types/employee'
import { JOB_LEVEL_OPTIONS, formatPositionLabel, type JobLevel } from '@/features/positions/types/job-level'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
const props = defineProps<{
  search: string
  departmentId: number | null
  positionId: number | null
  jobLevel: JobLevel | ''
  employmentStatus: string
  departments: DeptOption[]
  positions: PositionOption[]
}>()

const emit = defineEmits<{
  apply: [search: string, deptId: number | null, posId: number | null, jobLevel: JobLevel | '', status: string]
}>()

const localSearch = ref(props.search)
const localDeptId = ref<number | null>(props.departmentId)
const localPosId = ref<number | null>(props.positionId)
const localJobLevel = ref<JobLevel | ''>(props.jobLevel)
const localStatus = ref(props.employmentStatus)

const filteredPositions = computed(() => {
  if (!localDeptId.value) return props.positions
  return props.positions.filter((p) => p.department_id === localDeptId.value)
})

function onDeptChange() {
  if (localPosId.value) {
    const stillValid = filteredPositions.value.some((p) => p.id === localPosId.value)
    if (!stillValid) localPosId.value = null
  }
}

function handleSearch() {
  emit('apply', localSearch.value, localDeptId.value, localPosId.value, localJobLevel.value ?? '', localStatus.value ?? '')
}

function handleReset() {
  localSearch.value = ''
  localDeptId.value = null
  localPosId.value = null
  localJobLevel.value = ''
  localStatus.value = ''
  emit('apply', '', null, null, '', '')
}
</script>

<template>
  <div class="grid md:grid-cols-5 grid-cols-6 gap-3 items-center">
    <BaseInput
      v-model="localSearch"
      placeholder="Search employee ID, name, or email"
      clearable
      class="col-span-2"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    >
      <template #prefix>
        <Search class="w-4 h-4 text-slate-400" />
      </template>
    </BaseInput>

    <BaseSelect
      v-model="localDeptId"
      :options="departments.map((d) => ({ label: d.name, value: d.id }))"
      placeholder="All Departments"
      clearable
      @change="onDeptChange"
    />

    <BaseSelect
      v-model="localPosId"
      :options="filteredPositions.map((p) => ({ label: formatPositionLabel(p.name, p.job_level), value: p.id }))"
      placeholder="All Positions"
      clearable
      filterable
    />

    <BaseSelect v-model="localJobLevel" :options="JOB_LEVEL_OPTIONS" placeholder="All Job Levels" clearable />

    <BaseSelect v-model="localStatus" :options="EMPLOYMENT_STATUS_OPTIONS" placeholder="All Status" clearable />

    <div class="flex gap-2">
      <SearchButton  @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
