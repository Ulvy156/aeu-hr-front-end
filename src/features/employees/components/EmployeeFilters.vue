<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput } from '@/components/common'
import type { DeptOption, PositionOption } from '../types/employee'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
const props = defineProps<{
  search: string
  departmentId: number | null
  positionId: number | null
  employmentStatus: string
  departments: DeptOption[]
  positions: PositionOption[]
}>()

const emit = defineEmits<{
  apply: [search: string, deptId: number | null, posId: number | null, status: string]
}>()

const localSearch = ref(props.search)
const localDeptId = ref<number | null>(props.departmentId)
const localPosId = ref<number | null>(props.positionId)
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
  emit('apply', localSearch.value, localDeptId.value, localPosId.value, localStatus.value ?? '')
}

function handleReset() {
  localSearch.value = ''
  localDeptId.value = null
  localPosId.value = null
  localStatus.value = ''
  emit('apply', '', null, null, '')
}
</script>

<template>
  <div class="grid grid-cols-6 gap-3 items-center">
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

    <el-select
      v-model="localDeptId"
      placeholder="All Departments"
      clearable
      class="w-full"
      @change="onDeptChange"
    >
      <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
    </el-select>

    <el-select
      v-model="localPosId"
      placeholder="All Positions"
      clearable
      filterable
      class="w-full"
    >
      <el-option v-for="p in filteredPositions" :key="p.id" :label="p.name" :value="p.id" />
    </el-select>

    <el-select v-model="localStatus" placeholder="All Status" clearable class="w-full">
      <el-option label="Active" value="active" />
      <el-option label="Resigned" value="resigned" />
      <el-option label="Terminated" value="terminated" />
    </el-select>

    <div class="flex gap-2">
      <SearchButton  @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
