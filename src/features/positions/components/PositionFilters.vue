<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput } from '@/components/common'
import type { DepartmentOption } from '../types/position'
import BaseButton from '@/components/common/BaseButton.vue'
const props = defineProps<{
  search: string
  departmentId: number | null
  status: string
  departments: DepartmentOption[]
}>()

const emit = defineEmits<{
  apply: [search: string, departmentId: number | null, status: string]
}>()

const localSearch = ref(props.search)
const localDepartmentId = ref<number | null>(props.departmentId)
const localStatus = ref(props.status)

function handleSearch() {
  emit('apply', localSearch.value, localDepartmentId.value, localStatus.value ?? '')
}

function handleReset() {
  localSearch.value = ''
  localDepartmentId.value = null
  localStatus.value = ''
  emit('apply', '', null, '')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <BaseInput
      v-model="localSearch"
      placeholder="Search by position name..."
      clearable
      class="flex-1 min-w-[180px]"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    >
      <template #prefix>
        <Search class="w-4 h-4 text-slate-400" />
      </template>
    </BaseInput>

    <el-select
      v-model="localDepartmentId"
      placeholder="All Departments"
      class="w-48"
      clearable
    >
      <el-option
        v-for="dept in departments"
        :key="dept.id"
        :label="dept.name"
        :value="dept.id"
      />
    </el-select>

    <el-select
      v-model="localStatus"
      placeholder="All Status"
      class="w-36"
      clearable
    >
      <el-option label="Active" value="active" />
      <el-option label="Inactive" value="inactive" />
    </el-select>

    <BaseButton type="primary" @click="handleSearch">Search</BaseButton>
    <BaseButton @click="handleReset">Reset</BaseButton>
  </div>
</template>
