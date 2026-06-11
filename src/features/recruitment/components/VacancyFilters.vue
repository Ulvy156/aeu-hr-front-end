<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@lucide/vue'
import { BaseInput } from '@/components/common'
import SearchButton from '@/components/resuable/SearchButton.vue'
import ResetButton from '@/components/resuable/ResetButton.vue'
import { fetchDepartments } from '@/features/departments/services/department.api'
import type { VacancyStatus } from '../types/vacancy'

const props = defineProps<{
  search: string
  department: number | null
  status: VacancyStatus | ''
  targetHiringDate: string
}>()

const emit = defineEmits<{
  apply: [search: string, department: number | null, status: VacancyStatus | '', targetHiringDate: string]
}>()

const localSearch = ref(props.search)
const localDepartment = ref<number | null>(props.department)
const localStatus = ref<VacancyStatus | ''>(props.status)
const localTargetHiringDate = ref(props.targetHiringDate)

const departmentOptions = ref<{ id: number; name: string }[]>([])

onMounted(async () => {
  const res = await fetchDepartments({ status: 'active', per_page: 100 })
  departmentOptions.value = res.data.map((d) => ({ id: d.id, name: d.name }))
})

function handleSearch() {
  emit('apply', localSearch.value, localDepartment.value, localStatus.value, localTargetHiringDate.value)
}

function handleReset() {
  localSearch.value = ''
  localDepartment.value = null
  localStatus.value = ''
  localTargetHiringDate.value = ''
  emit('apply', '', null, '', '')
}
</script>

<template>
  <div class="flex flex-wrap justify-between items-center gap-3">
    <div class="flex flex-wrap gap-3 flex-1">
      <BaseInput
        v-model="localSearch"
        placeholder="Search by title..."
        clearable
        class="w-56"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </BaseInput>

      <el-select v-model="localDepartment" placeholder="All Departments" clearable class="w-48">
        <el-option v-for="opt in departmentOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
      </el-select>

      <el-select v-model="localStatus" placeholder="All Status" clearable class="w-36">
        <el-option label="Open" value="open" />
        <el-option label="Closed" value="closed" />
      </el-select>

      <el-date-picker
        v-model="localTargetHiringDate"
        type="date"
        placeholder="Target Hiring Date"
        value-format="YYYY-MM-DD"
        class="w-48!"
      />
    </div>

    <div class="flex justify-end">
      <SearchButton @click="handleSearch" />
      <ResetButton @click="handleReset" />
    </div>
  </div>
</template>
