<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput } from '@/components/common'
import type { DepartmentOption } from '../types/position'
import { JOB_LEVEL_OPTIONS, type JobLevel } from '../types/job-level'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
const props = defineProps<{
  search: string
  departmentId: number | null
  jobLevel: JobLevel | ''
  status: string
  departments: DepartmentOption[]
}>()

const emit = defineEmits<{
  apply: [search: string, departmentId: number | null, jobLevel: JobLevel | '', status: string]
}>()

const localSearch = ref(props.search)
const localDepartmentId = ref<number | null>(props.departmentId)
const localJobLevel = ref<JobLevel | ''>(props.jobLevel)
const localStatus = ref(props.status)

function handleSearch() {
  emit('apply', localSearch.value, localDepartmentId.value, localJobLevel.value ?? '', localStatus.value ?? '')
}

function handleReset() {
  localSearch.value = ''
  localDepartmentId.value = null
  localJobLevel.value = ''
  localStatus.value = ''
  emit('apply', '', null, '', '')
}
</script>

<template>
  <div class="flex justify-between items-center gap-3">
    <div class="w-[80%] flex gap-x-3">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by position name..."
        clearable
        class="w-1/4"
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
        class="w-1/4"
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
        v-model="localJobLevel"
        placeholder="All Job Levels"
        class="w-1/4"
        clearable
      >
        <el-option
          v-for="opt in JOB_LEVEL_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-select
        v-model="localStatus"
        placeholder="All Status"
        class="w-1/4"
        clearable
      >
        <el-option label="Active" value="active" />
        <el-option label="Inactive" value="inactive" />
      </el-select>
    </div>

    <div>
      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
